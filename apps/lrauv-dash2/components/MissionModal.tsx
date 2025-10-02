import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  MissionModalView,
  MissionModalViewProps,
  ParameterProps,
  useManagedWaypoints,
  WaypointTableProps,
} from '@mbari/react-ui'
import { capitalize, makeOrdinal } from '@mbari/utils'
import {
  useUnits,
  useStations,
  useSbdOutgoingAlternativeAddresses,
  useCreateCommand,
  useSiteConfig,
} from '@mbari/api-client'
import { useMissionData } from '../lib/useMissionData'
import { useRouter } from 'next/router'
import { makeMissionCommand } from '../lib/makeCommand'
import toast from 'react-hot-toast'
import useGlobalDrawerState from '../lib/useGlobalDrawerState'
import useGlobalModalId from '../lib/useGlobalModalId'
import { useParameterOverrides } from '../lib/useParameterOverrides'
import { useWaypointCalculations } from '../lib/useWaypointCalculations'

export interface MissionModalProps {
  onClose: () => void
  className?: string
  style?: React.CSSProperties
}

const onFocusWaypoint: WaypointTableProps['onFocusWaypoint'] = (index) => {
  console.log(index)
}

const extractNum = (v: string | undefined) => v?.match(/-?\d+(?:\.\d+)?/)?.[0]

const MissionModal: React.FC<MissionModalProps> = ({
  onClose: handleClose,
}) => {
  const { globalModalId } = useGlobalModalId()
  // Global waypoints
  const { handleWaypointsUpdate, updatedWaypoints } = useManagedWaypoints()
  const onClose = useCallback(() => {
    handleWaypointsUpdate([])
    handleClose?.()
  }, [handleClose, handleWaypointsUpdate])

  const { estDistance } = useWaypointCalculations(updatedWaypoints)

  // Query param state
  const router = useRouter()
  const { drawerOpen, setDrawerOpen } = useGlobalDrawerState()
  const params = (router.query?.deployment ?? []) as string[]
  const vehicleName = params[0]

  // Network supplied data
  const { data: vehicleInfo } = useSiteConfig()
  const vehicles = vehicleInfo?.vehicleNames ?? []
  const { data: alternativeAddresses } = useSbdOutgoingAlternativeAddresses({})
  const { data: unitsData } = useUnits()

  const {
    mutate: createCommand,
    isLoading: sendingCommand,
    isSuccess: commandSent,
    isError: commandError,
  } = useCreateCommand()

  useEffect(() => {
    if (commandSent) {
      toast.success('Command sent')
      onClose()
    } else if (commandError) {
      toast.error(`Error sending command: ${commandError}`)
    }
  }, [commandSent, commandError, onClose])

  useEffect(() => {
    if (drawerOpen) {
      setDrawerOpen(false)
    }
  })
  const [selectedMission, setSelectedMission] = useState<string | undefined>(
    undefined
  )
  const [selectedMissionCategory, setSelectedMissionCategory] = useState<
    string | undefined
  >('Recent Runs')

  const [showAllVehicleMissions, setShowAllVehicleMissions] = useState(false)

  const {
    recentRuns,
    allMissions: missions,
    selectedMissionData,
    isRecentRunsLoading: recentRunsLoading,
    missionCategories,
  } = useMissionData({ vehicleName, selectedMission, showAllVehicleMissions })

  const {
    parameters,
    safetyParams,
    commsParams,
    parametersWithOverrides,
    commsParamsWithOverrides,
    safetyParamsWithOverrides,
  } = useParameterOverrides({
    selectedMissionData,
    selectedMission,
    selectedMissionCategory,
    recentRuns,
  })

  const handleSelectMission = (id?: string | null) => {
    setSelectedMission(id ?? undefined)
  }

  const handleSelectMissionCategory = (category?: string) => {
    if (selectedMissionCategory !== category) {
      setSelectedMission(undefined)
      setSelectedMissionCategory(category)
    }
  }

  const waypoints: WaypointTableProps['waypoints'] =
    selectedMissionData?.latLonNamePairs?.map(({ latName, lonName }, index) => {
      const latArg = selectedMissionData.scriptArgs.find(
        (arg) => arg.name === latName
      )
      const lonArg = selectedMissionData.scriptArgs.find(
        (arg) => arg.name === lonName
      )

      let latValue: string | undefined = latArg?.value
      let lonValue: string | undefined = lonArg?.value

      // If this is a recent run, use its waypoint overrides
      if (selectedMissionCategory === 'Recent Runs' && selectedMission) {
        const selectedRun = recentRuns.find(
          (run) => run.id === selectedMission
        ) as any

        if (selectedRun?.waypointOverrides?.length) {
          const latOverride = selectedRun.waypointOverrides.find(
            (o: { name: string; value: string }) => o.name === latName
          )
          const lonOverride = selectedRun.waypointOverrides.find(
            (o: { name: string; value: string }) => o.name === lonName
          )

          const latNum = extractNum(latOverride?.value)
          const lonNum = extractNum(lonOverride?.value)

          if (latNum) latValue = latNum
          if (lonNum) lonValue = lonNum
        }
      }

      return {
        latName,
        lonName,
        lat: latValue,
        lon: lonValue,
        description:
          latArg?.description ??
          `Latitude of ${makeOrdinal(index + 1)} waypoint. If NaN, waypoint
        will be skipped/Longitude of ${makeOrdinal(index + 1)} waypoint.`,
      }
    }) ?? []

  const { data: stationsData } = useStations({ enabled: waypoints.length > 0 })
  // GeoJSON coordinates are in [lon, lat] order
  const stations: WaypointTableProps['stations'] =
    stationsData?.map(({ name, geojson }) => ({
      name,
      lat: `${geojson.geometry.coordinates[1]}`,
      lon: `${geojson.geometry.coordinates[0]}`,
    })) ?? []

  const [previewText, setPreviewText] = useState<string | undefined>()

  const handleSchedule: MissionModalViewProps['onSchedule'] = async ({
    confirmedVehicle,
    parameterOverrides,
    selectedMissionId,
    scheduleMethod,
    specifiedTime,
    alternateAddress,
    notes,
    preview,
    commType,
    timeout,
  }) => {
    const {
      commandText: formattedCommandText,
      schedDate,
      previewSbd,
    } = makeMissionCommand({
      mission: selectedMissionId as string,
      parameterOverrides,
      scheduleMethod,
      specifiedLocalTime: specifiedTime ?? undefined,
      units: unitsData,
    })

    setPreviewText(previewSbd)

    if (!preview) {
      createCommand({
        vehicle: confirmedVehicle?.toLowerCase() ?? '',
        path: selectedMission as string,
        commandNote: notes ?? '',
        runCommand: 'y',
        schedDate,
        destinationAddress: alternateAddress ?? undefined,
        commandText: formattedCommandText ?? '',
        via: commType,
        timeout,
      })
    }
  }

  return (
    <MissionModalView
      style={{ maxHeight: '80vh' }}
      alternativeAddresses={alternativeAddresses}
      currentStepIndex={0}
      vehicleName={capitalize(vehicleName)}
      bottomDepth="n/a"
      totalDistance={estDistance ? `${estDistance.toPrecision(4)}km` : 'n/a'}
      duration={
        estDistance ? (estDistance / 3.2).toPrecision(2) + ' hours' : 'n/a'
      }
      unfilteredMissionParameters={
        (selectedMissionData?.scriptArgs ?? []) as ParameterProps[]
      }
      missionCategories={missionCategories.map((c) => ({
        id: c.id,
        name: c.name,
      }))}
      parameters={parameters}
      safetyParams={safetyParams}
      commsParams={commsParams}
      onCancel={onClose}
      onSchedule={handleSchedule}
      missions={missions ?? []}
      onSelectMission={handleSelectMission}
      waypoints={waypoints}
      stations={stations}
      onFocusWaypoint={onFocusWaypoint}
      vehicles={vehicles}
      loading={sendingCommand}
      missionsLoading={recentRunsLoading}
      previewText={previewText}
      unitOptions={unitsData}
      selectedId={selectedMission}
      onSelectMissionCategory={handleSelectMissionCategory}
      selectedMissionCategory={selectedMissionCategory}
      defaultSearchText={globalModalId?.meta?.mission ?? ''}
      showAllVehicleMissions={showAllVehicleMissions}
      onShowAllVehicleMissions={setShowAllVehicleMissions}
      defaultOverrides={
        selectedMissionCategory === 'Recent Runs'
          ? [
              ...parametersWithOverrides,
              ...commsParamsWithOverrides,
              ...safetyParamsWithOverrides,
            ]
          : undefined
      }
    />
  )
}

export default MissionModal
