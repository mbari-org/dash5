import { useState } from 'react'
import {
  MissionModal as MissionModalView,
  MissionTableProps,
  ParameterProps,
  WaypointTableProps,
} from '@mbari/react-ui'
import { capitalize, capitalizeEach, makeOrdinal } from '@mbari/utils'
import {
  useMissionList,
  useRecentRuns,
  useScript,
  useStations,
} from '@mbari/api-client'
import { useRouter } from 'next/router'
import { DateTime } from 'luxon'
import useTrackedVehicles from '../lib/useTrackedVehicles'

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

const MissionModal: React.FC<MissionModalProps> = ({ onClose }) => {
  const router = useRouter()
  const params = (router.query?.deployment ?? []) as string[]
  const vehicleName = params[0]
  const { trackedVehicles: vehicles } = useTrackedVehicles()
  const { data: missionData } = useMissionList()
  const { data: recentRunsData } = useRecentRuns(
    {
      vehicles,
      from: DateTime.now().minus({ days: 60 }).toISODate(),
    },
    { enabled: !!vehicleName }
  )

  const missionCategories = [
    {
      id: 'Recent Runs',
      name: 'Recent Runs',
    },
    ...(missionData?.list
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
      ) ?? []),
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

  const missions: MissionTableProps['missions'] = [
    ...recentRuns,
    ...(missionData?.list?.map((mission) => {
      const { category, name } = parseMissionPath(mission.path)
      return {
        id: mission.path,
        category,
        name,
        task: '',
        description: mission.description,
        vehicle: vehicleName,
      }
    }) ?? []),
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

  const { data: stationsData } = useStations({ enabled: waypoints.length > 0 })
  const stations: WaypointTableProps['stations'] =
    stationsData?.map(({ name, geojson }) => ({
      name,
      lat: geojson.geometry.coordinates[0],
      lon: geojson.geometry.coordinates[1],
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
  const parameters: ParameterProps[] =
    selectedMissionData?.scriptArgs
      .filter(({ name }) => !reservedParams.includes(name))
      .map((arg) => ({
        description: arg.description ?? '',
        name: arg.name,
        unit: arg.unit,
        value: arg.value,
      })) ?? []

  const commsParams =
    selectedMissionData?.inserts.find(({ id }) => id.match(/comms/i))
      ?.scriptArgs ?? []

  const safetyParams =
    selectedMissionData?.inserts.find(({ id }) => id.match(/envelope/i))
      ?.scriptArgs ?? []

  return (
    <MissionModalView
      style={{ maxHeight: '80vh' }}
      currentIndex={0}
      vehicleName={capitalize(vehicleName)}
      bottomDepth="n/a"
      totalDistance="n/a"
      duration="n/a"
      missionCategories={missionCategories}
      parameters={parameters}
      safetyParams={safetyParams}
      commsParams={commsParams}
      onCancel={() => {
        console.log('cancel')
        onClose()
      }}
      onSchedule={() => {
        console.log('schedule')
        onClose()
      }}
      missions={missions ?? []}
      onSelectMission={setSelectedMission}
      waypoints={waypoints}
      stations={stations}
      onFocusWaypoint={onFocusWaypoint}
    />
  )
}

export default MissionModal
