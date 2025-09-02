import { useMemo } from 'react'
import {
  useFrequentRuns,
  useMissionList,
  useRecentRuns,
  useScript,
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
}) => {
  const { vehicleName, selectedMission } = params

  const { data: missionData } = useMissionList()
  // this gets the original mission template data (ie it would be the original sci2_flat_and_level mission, not a recent run of sci2_flat_and_level where the pilot has applied overrides)
  const { data: selectedMissionData } = useScript(
    {
      path: selectedMission as string,
      gitRef: missionData?.gitRef ?? 'master',
    },
    { enabled: !!selectedMission }
  )

  const recentRunsParams = useMemo(
    () => ({
      vehicles: [], // All vehicles by default
      from: LAST_60_DAYS,
    }),
    []
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

  const frequentRuns: Mission[] =
    frequentRunsData
      ?.map((d) => {
        const relatedMission = missionData?.list?.find(
          ({ path }) => path === d?.mission
        )
        return (relatedMission && {
          ...convertMissionDataToListItem(vehicleName)(relatedMission),
          frequentRun: true,
        }) as Mission
      })
      .filter((i) => i) ?? []

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

  const allMissions: Mission[] = [
    ...recentRuns,
    ...frequentRuns,
    ...(missionData?.list?.map(convertMissionDataToListItem(vehicleName)) ??
      []),
  ]

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
