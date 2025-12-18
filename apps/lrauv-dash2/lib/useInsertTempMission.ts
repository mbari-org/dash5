import { useMemo } from 'react'
import { DateTime } from 'luxon'
import { capitalize, capitalizeEach, parseMissionPath } from '@mbari/utils'
import { extractOverrides, GetScriptResponse } from '@mbari/api-client'
import { Mission } from '@mbari/react-ui'
import { GlobalModalMetaData } from './useGlobalModalId'

interface UseInsertTempMissionParams {
  globalModalMeta?: GlobalModalMetaData | null
  missions: Mission[]
  recentRuns: Mission[]
  selectedMissionData?: GetScriptResponse
  vehicleName: string
}

/**
 * Hook to insert a temporary mission entry at the top of recent runs when rerunning
 * from schedule history. If the exact same mission (same path, parameters, and waypoints)
 * already exists in recent runs, returns the original missions list unchanged.
 */
export const useInsertTempMission = ({
  globalModalMeta,
  missions,
  recentRuns,
  selectedMissionData,
  vehicleName,
}: UseInsertTempMissionParams): Mission[] => {
  return useMemo(() => {
    const eventData = globalModalMeta?.eventData
    const missionPath = globalModalMeta?.mission
    const eventUser = globalModalMeta?.eventUser
    const eventNote = globalModalMeta?.eventNote
    const eventIsoTime = globalModalMeta?.eventIsoTime
    const eventVehicleName = globalModalMeta?.eventVehicleName

    if (
      !eventData ||
      !missionPath ||
      !selectedMissionData?.latLonNamePairs ||
      !missions
    ) {
      return missions
    }

    // Extract overrides from eventData
    const { parameterOverrides, waypointOverrides } = extractOverrides(
      eventData,
      selectedMissionData.latLonNamePairs
    )

    // Always create temporary mission entry when rerunning from schedule history
    // This ensures the user sees the exact mission they're rerunning at the top
    const { category, name } = parseMissionPath(missionPath)
    const temporaryMission: Mission = {
      id: missionPath,
      category,
      name,
      description: eventData,
      vehicle: eventVehicleName ?? vehicleName ?? undefined,
      ranOn: eventIsoTime
        ? capitalize(DateTime.fromISO(eventIsoTime).toFormat('MMM. d yyyy'))
        : capitalize(DateTime.now().toFormat('MMM. d yyyy')),
      ranBy: capitalizeEach(eventUser ?? ''),
      recentRun: true,
      note: eventNote ?? undefined,
      waypointOverrides,
      parameterOverrides,
      parameterCount: parameterOverrides.length,
      waypointCount: waypointOverrides.length,
    }

    // Insert at the top of recent runs, but don't modify the original list
    const recentRunsWithTemp = [temporaryMission, ...recentRuns]
    // Replace the recent runs in the missions list
    const otherMissions = missions.filter((m) => !m.recentRun)
    return [...recentRunsWithTemp, ...otherMissions]
  }, [
    globalModalMeta?.eventData,
    globalModalMeta?.mission,
    globalModalMeta?.eventUser,
    globalModalMeta?.eventNote,
    globalModalMeta?.eventIsoTime,
    globalModalMeta?.eventVehicleName,
    selectedMissionData?.latLonNamePairs,
    missions,
    recentRuns,
    vehicleName,
  ])
}
