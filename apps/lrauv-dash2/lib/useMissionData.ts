import { useMemo } from 'react'
import {
  useFrequentRuns,
  useMissionList,
  useRecentRuns,
  useScript,
  useSiteConfig,
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
  const { data: siteInfo } = useSiteConfig()

  const frequentVehicles = useMemo(() => {
    if (showAllVehicleMissions) return siteInfo?.vehicleNames ?? []
    return vehicleName ? [vehicleName] : []
  }, [showAllVehicleMissions, siteInfo?.vehicleNames, vehicleName])

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

  const gitRef = missionData?.gitRef ?? 'master'

  const { data: normalizedFrequentRuns, isLoading: isFrequentRunsLoading } =
    useFrequentRuns(
      {
        vehicles: frequentVehicles,
        gitRef,
      },
      {
        enabled: frequentVehicles.length > 0,
        staleTime: 60 * 1000,
      }
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

  const frequentRuns: Mission[] = useMemo(() => {
    if (!normalizedFrequentRuns?.length || !missionData?.list) return []

    const needsVehiclePrefix =
      showAllVehicleMissions || frequentVehicles.length > 1

    const results: Mission[] = []

    for (const run of normalizedFrequentRuns) {
      const relatedMission = missionData.list.find(
        ({ path }) => path === run.missionPath
      )
      if (!relatedMission) continue

      const { waypointOverrides, parameterOverrides } = run
      const missionPath = relatedMission.path
      const hasOverrides =
        waypointOverrides.length > 0 || parameterOverrides.length > 0
      const baseId = hasOverrides ? run.selectionId : missionPath

      const id = needsVehiclePrefix ? `${run.vehicle}|${baseId}` : baseId

      results.push({
        ...convertMissionDataToListItem(run.vehicle)(relatedMission),
        id,
        missionPath,
        frequentRun: true,
        waypointOverrides,
        parameterOverrides,
        parameterCount: parameterOverrides.length,
        waypointCount: waypointOverrides.length,
      } as Mission)
    }

    return results.filter(
      (mission, index, s) => s.findIndex((m) => m.id === mission.id) === index
    )
  }, [
    normalizedFrequentRuns,
    missionData?.list,
    showAllVehicleMissions,
    frequentVehicles,
  ])

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
    isFrequentRunsLoading,
  }
}
