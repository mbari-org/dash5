import { useEffect, useRef, useState } from 'react'
import {
  MissionModal as MissionModalView,
  MissionModalProps as MissionModalViewProps,
  MissionTableProps,
  ParameterProps,
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
import { ScheduleOption } from 'react-ui/dist'
import useGlobalDrawerState from '../lib/useGlobalDrawerState'
import useManagedMapMarkers from '../lib/useManagedMapMarkers'

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

const MissionModal: React.FC<MissionModalProps> = ({ onClose }) => {
  const router = useRouter()
  const { drawerOpen, setDrawerOpen } = useGlobalDrawerState()
  const params = (router.query?.deployment ?? []) as string[]
  const vehicleName = params[0]
  const { data: vehicles } = useVehicleNames({ refresh: 'n' })
  const { data: alternativeAddresses } = useSbdOutgoingAlternativeAddresses({})
  const { data: missionData } = useMissionList()
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

  const [selectedMission, setSelectedMission] = useState<string | undefined>()
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

  const { setMapMarkers } = useManagedMapMarkers()
  const mapMarkers = useRef<string>('')
  const missionMapMarkersJSON = JSON.stringify(waypoints ?? '')
  useEffect(() => {
    if (mapMarkers.current !== missionMapMarkersJSON) {
      console.log('Updating map markers')
      setMapMarkers(
        waypoints
          .map(({ lat, lon }, i) =>
            lat === 'NaN'
              ? null
              : { index: i, lat: parseFloat(lat), lon: parseFloat(lon) }
          )
          .filter((i) => i)
      )
      mapMarkers.current = missionMapMarkersJSON
    } else {
      console.log(
        "Ignoring map markers update because they haven't changed",
        missionMapMarkersJSON
      )
    }
  }, [setMapMarkers, mapMarkers.current, missionMapMarkersJSON, waypoints])

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
    const missionCommand = makeMissionCommand({
      mission: selectedMissionId as string,
      parameterOverrides,
      scheduleMethod: scheduleMethod as ScheduleOption,
      specifiedTime: specifiedTime ?? undefined,
    })
    setCommandText(missionCommand)
    if (!preview) {
      createCommand({
        vehicle: confirmedVehicle?.toLowerCase() ?? '',
        path: selectedMission as string,
        commandNote: notes ?? '',
        runCommand: 'y',
        schedDate: specifiedTime ?? 'asap',
        destinationAddress: alternateAddress ?? undefined,
        commandText: commandText ?? '',
      })
    }
  }

  return (
    <MissionModalView
      style={{ maxHeight: '80vh' }}
      alternativeAddresses={alternativeAddresses}
      currentIndex={0}
      vehicleName={capitalize(vehicleName)}
      bottomDepth="n/a"
      totalDistance="n/a"
      duration="n/a"
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
    />
  )
}

export default MissionModal
