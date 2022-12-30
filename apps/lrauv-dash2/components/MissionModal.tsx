import {
  MissionModal as MissionModalView,
  MissionTableProps,
  ParameterProps,
  WaypointTableProps,
} from '@mbari/react-ui'
import { makeOrdinal } from '@mbari/utils'

export interface MissionModalProps {
  onClose: () => void
}

const missions: MissionTableProps['missions'] = [
  {
    id: '1',
    category: 'Science',
    name: 'sci2',
    task: 'Test mission',
    description:
      "Vehicle yo-yo's to the specified waypoints, with science turned on.",
    vehicle: 'Brizo',
    ranBy: 'Jordan Caress',
    ranOn: 'Dec. 10, 2021',
    waypointCount: 2,
  },
  {
    id: '2',
    category: 'Science',
    name: 'sci2',

    task: 'Test mission',
    description:
      "Vehicle yo-yo's to the specified waypoints, with science turned on.",
    vehicle: 'Tethys',
    ranBy: 'Joost Daniels',
    ranOn: 'Dec. 10, 2021',
    waypointCount: 4,
  },
  {
    id: '3',
    category: 'Science',
    name: 'profile_station',
    task: 'Profile station at C1 for the night',
    description: 'This mission yoyos in a circle around a specified location.',
    vehicle: 'Tethys',
    ranBy: 'Ben Ranaan',
    ranOn: 'Dec. 10, 2021',
    ranAt: 'C1',
  },
  {
    id: '4',
    category: 'Science',
    name: 'sci2',
    task: 'more okeanids testing',
    description:
      "Vehicle yo-yo's to the specified waypoints, with science turned on.",
    vehicle: 'Tethys',
    ranBy: 'Carlos Rueda',
    ranOn: 'Aug. 27, 2021',
    waypointCount: 2,
  },
  {
    id: '5',
    category: 'Science',
    name: 'esp_sample_at_depth',
    task: 'sending final doublet sampling mission',
    description: 'This mission takes ESP samples at the designated depth.',
    vehicle: 'Brizo',
    ranBy: 'Greg Doucette',
    ranOn: 'Aug. 16, 2021',
  },
  {
    id: '6',
    category: 'Maintenance',
    name: 'ballast_and_trim',
    task: 'running B&T until next sampling',
    vehicle: 'Brizo',
    ranBy: 'Greg Doucette',
    ranOn: 'Aug. 16, 2021',
  },
]

const waypoints: WaypointTableProps['waypoints'] = Array(5)
  .fill(0)
  .map((_, index) => ({
    latName: `Lat${index + 1}`,
    lonName: `Lon${index + 1}`,
    lat: '',
    lon: '',
    description: `Latitude of ${makeOrdinal(
      index + 1
    )} waypoint. If NaN, waypoint
        will be skipped/Longitude of ${makeOrdinal(index + 1)} waypoint.`,
  }))
  .concat([
    {
      latName: 'Lat6',
      lonName: 'Lon6',
      lat: '33.333',
      lon: '-141.111',
      description:
        'Latitude of 6th waypoint. If NaN, waypoint will be skipped/Longitude of 6th waypoint.',
    },
  ])

const stations: WaypointTableProps['stations'] = [
  { name: 'C1', lat: '36.797', lon: '-121.847' },
  { name: 'C2', lat: '46.797', lon: '-141.847' },
]

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

const recentRuns = [
  {
    id: '1',
    name: 'Behavior',
  },
  {
    id: '2',
    name: 'Demo',
  },
  {
    id: '3',
    name: 'Engineering',
  },
  {
    id: '4',
    name: 'Insert',
  },
  {
    id: '5',
    name: 'Maintenance',
  },
  {
    id: '6',
    name: 'Regression',
  },
  {
    id: '7',
    name: 'Science',
  },
  {
    id: '8',
    name: 'Transport',
  },
]

const MissionModal: React.FC<MissionModalProps> = ({ onClose }) => {
  return (
    <MissionModalView
      currentIndex={0}
      vehicleName="Brizo"
      bottomDepth="100-180m"
      totalDistance="7.2km"
      duration="6hrs"
      recentRuns={recentRuns}
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
      missions={missions}
      onSelectMission={(id) => {
        console.log(`id: ${id}`)
      }}
      onSortColumn={(col, asc) => {
        console.log(
          `Clicked column number ${col}, which is sorted ${
            asc ? 'ascending' : 'descending'
          }`
        )
      }}
      waypoints={waypoints}
      stations={stations}
      onFocusWaypoint={onFocusWaypoint}
    />
  )
}

export default MissionModal
