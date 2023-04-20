import { useCallback, useEffect, useRef, useState } from 'react'
import {
  MissionModal as MissionModalView,
  MissionModalProps as MissionModalViewProps,
  MissionTableProps,
  ParameterProps,
  useManagedWaypoints,
  WaypointTableProps,
} from '@mbari/react-ui'
import {
  capitalize,
  capitalizeEach,
  makeOrdinal,
  sortByProperty,
} from '@mbari/utils'
import {
  MissionListItem,
  useFrequentRuns,
  useMissionList,
  useRecentRuns,
  useUnits,
  useScript,
  useStations,
  useSbdOutgoingAlternativeAddresses,
  useVehicleNames,
  useCreateCommand,
  ScriptArgument,
  ScriptInsert,
} from '@mbari/api-client'
import { useRouter } from 'next/router'
import { DateTime } from 'luxon'
import { makeMissionCommand } from '../lib/makeCommand'
import toast from 'react-hot-toast'
import { ScheduleOption } from '@mbari/react-ui'
import useGlobalDrawerState from '../lib/useGlobalDrawerState'
import { point, distance } from '@turf/turf'
import useGlobalModalId from '../lib/useGlobalModalId'

const insertForParameter = (
  argument: ScriptArgument,
  inserts: ScriptInsert[]
) => {
  const insert = inserts.find((i) =>
    i.scriptArgs.find((a) => a.name === argument.name)
  )
  if (insert) {
    return insert.id
  }
  return null
}

export interface MissionModalProps {
  onClose: () => void
  className?: string
  style?: React.CSSProperties
}

const onFocusWaypoint: WaypointTableProps['onFocusWaypoint'] = (index) => {
  console.log(index)
}

const parseMissionPath = (mission?: string) => {
  const path = mission?.split('/') ?? ''
  const category = path?.length > 1 ? path[0] : ''
  const name = (path?.length === 1 ? path[0] : path[1]).split('.')[0]
  return { category, name }
}

const convertMissionDataToListItem =
  (vehicleName: string) => (mission: MissionListItem) => {
    const { category, name } = parseMissionPath(mission.path)
    return {
      id: mission.path,
      category,
      name,
      task: '',
      description: mission.description,
      vehicle: vehicleName,
    }
  }

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
  const [estDistance, setEstDistance] = useState<number | null>(null)
  useEffect(() => {
    const applicableWaypoints = updatedWaypoints.filter(
      (w) =>
        ![
          w.lat?.toLowerCase() ?? 'nan',
          w.lon?.toLocaleLowerCase() ?? 'nan',
        ].includes('nan')
    )
    if (applicableWaypoints.length > 0) {
      const newDistance = applicableWaypoints.reduce((acc, curr, index) => {
        if (index === 0) {
          return acc
        }
        const prev = applicableWaypoints[index - 1]
        return (
          acc +
          distance(
            point([Number(curr.lat ?? 0), Number(curr.lon ?? 0)]),
            point([Number(prev.lat ?? 0), Number(prev.lon ?? 0)]),
            { units: 'kilometers' }
          )
        )
      }, 0)
      if (newDistance !== estDistance) {
        setEstDistance(newDistance)
      }
    } else {
      if (estDistance) {
        setEstDistance(null)
      }
    }
  }, [estDistance, setEstDistance, updatedWaypoints])

  // Query param state
  const router = useRouter()
  const { drawerOpen, setDrawerOpen } = useGlobalDrawerState()
  const params = (router.query?.deployment ?? []) as string[]
  const vehicleName = params[0]

  // Network supplied data
  const { data: vehicles } = useVehicleNames({ refresh: 'n' })
  const { data: alternativeAddresses } = useSbdOutgoingAlternativeAddresses({})
  const { data: missionData } = useMissionList()
  const { data: unitsData } = useUnits()
  const { data: frequentRunsData } = useFrequentRuns(
    {
      vehicle: vehicleName,
    },
    { enabled: !!vehicleName }
  )
  const { data: recentRunsData } = useRecentRuns(
    {
      vehicles: vehicles ?? [],
      from: DateTime.now().minus({ days: 60 }).toISODate(),
    },
    { enabled: !!vehicles }
  )
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

  const recentRuns: MissionTableProps['missions'] =
    recentRunsData
      ?.map(({ mission, vehicleName: vehicle, isoTime, user }) => {
        const { category, name } = parseMissionPath(mission)
        return {
          id: mission,
          category,
          name,
          description: mission,
          vehicle,
          ranOn: capitalize(DateTime.fromISO(isoTime).toFormat('MMM. d yyyy')),
          ranBy: capitalizeEach(user ?? ''),
          recentRun: true,
        }
      })
      .filter(
        (mission, index, s) => s.findIndex((m) => m.id === mission.id) === index
      ) ?? []

  const frequentRuns: MissionTableProps['missions'] =
    (frequentRunsData
      ?.map((d) => {
        const relatedMission = missionData?.list?.find(
          ({ path }) => path === d?.mission
        )
        return (
          relatedMission && {
            ...convertMissionDataToListItem(vehicleName)(relatedMission),
            frequentRun: true,
          }
        )
      })
      .filter((i) => i) as MissionTableProps['missions']) ?? []

  const missions: MissionTableProps['missions'] = [
    ...recentRuns,
    ...frequentRuns,
    ...(missionData?.list?.map(convertMissionDataToListItem(vehicleName)) ??
      []),
  ]

  const [selectedMission, setSelectedMission] = useState<string | undefined>(
    globalModalId?.meta?.mission ?? undefined
  )
  const selectedMissionCategory = selectedMission?.split('/')[0]
  const { data: selectedMissionData } = useScript(
    {
      path: selectedMission as string,
      gitRef: missionData?.gitRef ?? 'master',
    },
    { enabled: !!selectedMission }
  )

  const waypoints: WaypointTableProps['waypoints'] =
    selectedMissionData?.latLonNamePairs?.map(({ latName, lonName }, index) => {
      const latArg = selectedMissionData.scriptArgs.find(
        (arg) => arg.name === latName
      )
      const lonArg = selectedMissionData.scriptArgs.find(
        (arg) => arg.name === lonName
      )
      return {
        latName,
        lonName,
        lat: latArg?.value,
        lon: lonArg?.value,
        description:
          latArg?.description ??
          `Latitude of ${makeOrdinal(index + 1)} waypoint. If NaN, waypoint
        will be skipped/Longitude of ${makeOrdinal(index + 1)} waypoint.`,
      }
    }) ?? []

  const { data: stationsData } = useStations({ enabled: waypoints.length > 0 })
  const stations: WaypointTableProps['stations'] =
    stationsData?.map(({ name, geojson }) => ({
      name,
      lat: `${geojson.geometry.coordinates[0]}`,
      lon: `${geojson.geometry.coordinates[1]}`,
    })) ?? []

  const reservedParams: string[] = [
    selectedMissionData?.inserts
      ?.filter(({ id }) =>
        [/comms/i, /standard envelope/i].some((r) => r.test(id))
      )
      .map(({ scriptArgs }) => scriptArgs.map((arg) => arg.name)) ?? [],
    selectedMissionData?.latLonNamePairs?.map(({ latName, lonName }) => [
      latName,
      lonName,
    ]) ?? [],
  ]
    .flat(2)
    .filter((i) => i)

  const commsInsert = selectedMissionData?.inserts?.find(({ id }) =>
    id.match(/comms/i)
  )
  const safetyInsert = selectedMissionData?.inserts?.find(({ id }) =>
    id.match(/envelope/i)
  )

  const parameters: ParameterProps[] =
    [
      selectedMissionData?.inserts?.map((i) => i.scriptArgs).flat(),
      selectedMissionData?.scriptArgs.filter(
        ({ name }) => !reservedParams.includes(name)
      ),
    ]
      .flat()
      .map(
        (arg) =>
          ({
            description: arg?.description ?? '',
            name: arg?.name,
            unit: arg?.unit,
            value: arg?.value,
            insert:
              arg &&
              insertForParameter(arg, selectedMissionData?.inserts ?? []),
          } as ParameterProps)
      ) ?? []

  const commsParams =
    commsInsert?.scriptArgs.map((i) => ({ ...i, insert: commsInsert.id })) ?? []

  const safetyParams =
    safetyInsert?.scriptArgs.map((i) => ({ ...i, insert: safetyInsert.id })) ??
    []

  const [commandText, setCommandText] = useState<string | undefined>()

  const handleSchedule: MissionModalViewProps['onSchedule'] = ({
    confirmedVehicle,
    parameterOverrides,
    selectedMissionId,
    scheduleMethod,
    specifiedTime,
    alternateAddress,
    notes,
    preview,
  }) => {
    const { commandText, schedDate, previewSbd } = makeMissionCommand({
      mission: selectedMissionId as string,
      parameterOverrides,
      scheduleMethod: scheduleMethod as ScheduleOption,
      specifiedTime: specifiedTime ?? undefined,
    })
    setCommandText(previewSbd)
    if (!preview) {
      createCommand({
        vehicle: confirmedVehicle?.toLowerCase() ?? '',
        path: selectedMission as string,
        commandNote: notes ?? '',
        runCommand: 'y',
        schedDate,
        destinationAddress: alternateAddress ?? undefined,
        commandText: commandText ?? '',
      })
    }
  }

  const defaultOverrides: ParameterProps[] = []

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
      onSelectMission={setSelectedMission}
      waypoints={waypoints}
      stations={stations}
      onFocusWaypoint={onFocusWaypoint}
      vehicles={vehicles}
      loading={sendingCommand}
      commandText={commandText}
      unitOptions={unitsData}
      selectedId={selectedMission}
      selectedMissionCategory={selectedMissionCategory}
      defaultSearchText={globalModalId?.meta?.mission ?? ''}
      defaultOverrides={defaultOverrides}
    />
  )
}

export default MissionModal
