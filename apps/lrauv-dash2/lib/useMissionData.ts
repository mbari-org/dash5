import { useMemo } from 'react'
import { useQuery } from 'react-query'
import {
  extractOverridesWithScriptMetadata,
  generateMissionKey,
  getScript,
  useFrequentRuns,
  useMissionList,
  useRecentRuns,
  useScript,
  useTethysApiContext,
} from '@mbari/api-client'

import { Mission } from '@mbari/react-ui'
import {
  parseMissionPath,
  convertMissionDataToListItem,
  sortByProperty,
} from '@mbari/utils'

import { capitalize, capitalizeEach, getAdjustedUnixTime } from '@mbari/utils'
import { DateTime } from 'luxon'

const LAST_60_DAYS = getAdjustedUnixTime({
  unixTime: DateTime.now().toMillis(),
  offsetDays: -60,
})

export const useMissionData = (params: {
  vehicleName: string
  selectedMission?: string
  showAllVehicleMissions?: boolean
}) => {
  const { vehicleName, selectedMission, showAllVehicleMissions } = params

  const { data: missionData } = useMissionList()

  const recentRunsParams = useMemo(
    () => ({
      vehicles: showAllVehicleMissions ? [] : vehicleName ? [vehicleName] : [],
      from: showAllVehicleMissions ? LAST_60_DAYS : 0,
      limit: showAllVehicleMissions ? undefined : 100,
    }),
    [vehicleName, showAllVehicleMissions]
  )

  const { data: recentRunsData, isLoading: isRecentRunsLoading } =
    useRecentRuns(recentRunsParams, {
      staleTime: 60 * 1000,
    })
  const { data: frequentRunsData, isLoading: isFrequentRunsLoading } =
    useFrequentRuns(
      {
        vehicle: vehicleName,
      },
      { enabled: !!vehicleName }
    )

  const recentRuns: Mission[] = useMemo(() => {
    return (
      recentRunsData
        ?.map(
          ({
            data,
            mission,
            vehicleName,
            isoTime,
            user,
            note,
            parameterOverrides,
            waypointOverrides,
          }) => {
            const { category, name } = parseMissionPath(mission)
            return {
              id: mission,
              missionPath: mission,
              category,
              name,
              description: data,
              vehicle: vehicleName,
              ranOn: capitalize(
                DateTime.fromISO(isoTime).toFormat('MMM. d yyyy')
              ),
              ranBy: capitalizeEach(user ?? ''),
              recentRun: true,
              note,
              waypointOverrides,
              parameterOverrides,
              parameterCount: parameterOverrides.length,
              waypointCount: waypointOverrides.length,
            }
          }
        )
        .filter(
          (mission, index, s) =>
            s.findIndex((m) => m.id === mission.id) === index
        ) ?? []
    )
  }, [recentRunsData])

  const { axiosInstance, token } = useTethysApiContext()

  const frequentRunsProcessedQuery = useQuery(
    [
      'frequentRunsProcessed',
      frequentRunsData,
      missionData?.gitRef,
      missionData?.list,
      vehicleName,
    ],
    async () => {
      if (!frequentRunsData || !missionData?.list) return []

      // Cache script metadata requests so repeated missions don't refetch.
      const scriptRequestByMission = new Map<
        string,
        ReturnType<typeof getScript>
      >()

      const getScriptMetadata = async (missionPath: string) => {
        const existing = scriptRequestByMission.get(missionPath)
        if (existing) return existing

        const request = getScript(
          { path: missionPath, gitRef: missionData?.gitRef ?? 'master' },
          {
            instance: axiosInstance,
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        scriptRequestByMission.set(missionPath, request)
        return request
      }

      const results: Mission[] = []

      for (const d of frequentRunsData) {
        const relatedMission = missionData.list.find(
          ({ path }) => path === d?.mission
        )
        if (!relatedMission) continue

        const writtenCommand = d?.writtenCommand ?? ''
        const missionPathForFetch = d?.mission || undefined
        const { waypointOverrides, parameterOverrides } =
          await extractOverridesWithScriptMetadata(
            writtenCommand,
            missionPathForFetch,
            missionPathForFetch
              ? async () => getScriptMetadata(missionPathForFetch)
              : undefined,
            { logContext: d?.mission }
          )

        const missionPath = relatedMission.path
        const hasOverrides =
          waypointOverrides.length > 0 || parameterOverrides.length > 0
        const id = hasOverrides
          ? generateMissionKey({
              missionName: missionPath,
              waypointOverrides,
              parameterOverrides,
            })
          : missionPath

        results.push({
          ...convertMissionDataToListItem(vehicleName)(relatedMission),
          id,
          missionPath,
          frequentRun: true,
          waypointOverrides,
          parameterOverrides,
          parameterCount: parameterOverrides.length,
          waypointCount: waypointOverrides.length,
        } as Mission)
      }

      // Dedupe on the composite id so the list stays stable.
      return results.filter(
        (mission, index, s) => s.findIndex((m) => m.id === mission.id) === index
      )
    },
    {
      enabled:
        !!frequentRunsData?.length &&
        !!missionData?.list?.length &&
        !!vehicleName,
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    }
  )

  const frequentRuns: Mission[] = useMemo(() => {
    return frequentRunsProcessedQuery.data ?? []
  }, [frequentRunsProcessedQuery.data])

  const missionCategories = [
    {
      id: 'Recent Runs',
      name: 'Recent Runs',
    },
    {
      id: 'Frequent Runs',
      name: 'Frequent Runs',
    },
    ...sortByProperty({
      sortProperty: 'name',
      arrOfObj:
        missionData?.list
          ?.map((mission) => {
            const { category } = parseMissionPath(mission.path)
            return {
              id: category,
              name: category === '' ? 'Default' : category,
            }
          })
          .filter(
            (mission, index, self) =>
              self.findIndex((m) => m.id === mission.id) === index
          ) ?? [],
    }),
  ]

  const allMissions: Mission[] = useMemo(() => {
    return [
      ...recentRuns,
      ...frequentRuns,
      ...(missionData?.list?.map(convertMissionDataToListItem(vehicleName)) ??
        []),
    ]
  }, [recentRuns, frequentRuns, missionData?.list, vehicleName])

  const selectedScriptPath = useMemo(() => {
    if (!selectedMission) return undefined

    const selectedFromRuns = allMissions.find((m) => m.id === selectedMission)
    if (selectedFromRuns?.missionPath) return selectedFromRuns.missionPath

    // If the selection is a template mission, `id === path`.
    return missionData?.list?.find(({ path }) => path === selectedMission)?.path
  }, [allMissions, missionData?.list, selectedMission])

  // this gets the original mission template data (ie it would be the original sci2_flat_and_level mission, not a recent run of sci2_flat_and_level where the pilot has applied overrides)
  const { data: selectedMissionData } = useScript(
    {
      path: selectedScriptPath as string,
      gitRef: missionData?.gitRef ?? 'master',
    },
    { enabled: !!selectedScriptPath }
  )

  return {
    selectedMissionData,
    recentRuns,
    frequentRuns,
    missionCategories,
    allMissions,
    isRecentRunsLoading,
    isFrequentRunsLoading:
      isFrequentRunsLoading || frequentRunsProcessedQuery.isLoading,
  }
}
