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

const parameters: ParameterProps[] = [
  {
    description: '\n        Maximum duration of mission\n    ',
    name: 'MissionTimeout',
    unit: 'hour',
    value: '24',
    dvlOff: true,
  },
  {
    description:
      '\n        Transit surface communications. Elapsed time after previous surface\n        comms when vehicle will begin to ascend for additional surface\n        communications\n    ',
    name: 'NeedCommsTime',
    unit: 'minute',
    value: '45',
    overrideValue: '35',
  },
  {
    description:
      '\n        Number of times to repeat the waypoint trajectory. NOTE: When setting\n        the LapRepeat > 1 and running WPs in a loop, omit last/return waypoint\n        by setting LatX/LonX to NaN.\n    ',
    name: 'LapRepeat',
    unit: 'count',
    value: '1',
  },
  {
    description:
      '\n        Waypoint number to start the the waypoint trajectory with. The mission\n        will start with the specified waypoint and cycle through all the\n        subsequent waypoints.\n    ',
    name: 'StartWaypoint',
    unit: 'count',
    value: '1',
    overrideValue: '2',
  },
  {
    description:
      '\n        Minimum YoYo depth while transiting to waypoint.\n    ',
    name: 'TransitYoYoMinDepth',
    unit: 'meter',
    value: '5',
  },
  {
    description:
      '\n        Maximum YoYo depth while while transiting to waypoint.\n    ',
    name: 'TransitYoYoMaxDepth',
    unit: 'meter',
    value: '50',
  },
  {
    description: '\n        Turns on peak detection of Cholorphyll.\n    ',
    name: 'PeakDetectChlActive',
    value: 'False',
  },
  {
    description:
      '\n        If greater than zero, report a peak every window. If NaN or zero, this\n        variable is ignored.\n    ',
    name: 'TimeWindowPeakReport',
    unit: 'minute',
    value: 'NaN',
  },
  {
    description:
      '\n        Turns on reporting of the highest peak value of chlorophyll on yo-yo\n        profiles in a horizontal sliding window (of length\n        numProfilesSlidingwindow)\n    ',
    name: 'HighestChlPeakReportActive',
    value: 'False',
  },
]

const safetyParams: ParameterProps[] = [
  {
    description: '\n        Maximum duration of mission\n    ',
    name: 'MissionTimeout',
    unit: 'hour',
    value: '2',
    dvlOff: true,
  },
  {
    description: '\n        Maximum allowable depth during the mission\n    ',
    name: 'MaxDepth',
    unit: 'meter',
    value: '200',
  },
  {
    description:
      '\n        Minimum allowable altitude during the mission\n    ',
    name: 'MinAltitude',
    unit: 'meter',
    value: '200',
  },
  {
    description: '\n        Minimum distance from shore to maintain\n    ',
    name: 'MinOffshore',
    unit: 'meter',
    value: '2000',
  },
]

const commsParams: ParameterProps[] = [
  {
    description: '\n        How often to surface for communications\n    ',
    name: 'NeedCommsTime',
    unit: 'minute',
    value: '60',
  },
  {
    description:
      '\n        Elapsed time after most recent surfacing when vehicle will\n        begin to ascend to the surface again. The timing is actually...\n',
    name: 'DiveInterval',
    unit: 'hour',
    value: '3',
  },
]

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
