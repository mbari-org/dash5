import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { MissionModal, MissionModalProps } from './MissionModal'
import { MissionTableProps } from '../Tables/MissionTable'
import { WaypointTableProps } from '../Tables/WaypointTable'
import { makeOrdinal } from '@mbari/utils'
import { ParameterProps } from '../Tables/ParameterTable'

export default {
  title: 'Modals/MissionModal',
  component: MissionModal,
} as Meta

const Template: Story<MissionModalProps> = (args) => {
  return <MissionModal {...args} />
}

const missionTableArgs: MissionTableProps = {
  missions: [
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
      description:
        'This mission yoyos in a circle around a specified location.',
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
  ],
  onSelectMission: (id) => {
    console.log(`id: ${id}`)
  },
  onSortColumn: (col, isAsc) => {
    console.log(
      `Clicked column number ${col}, which is sorted ${
        isAsc ? 'ascending' : 'descending'
      }`
    )
  },
}

const waypointTableArgs: WaypointTableProps = {
  waypoints: Array(5)
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
    ]),
  stations: [
    { name: 'C1', lat: '36.797', lon: '-121.847' },
    { name: 'C2', lat: '46.797', lon: '-141.847' },
  ],
  onFocusWaypoint: (index) => {
    console.log(index)
  },
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

const args = {
  currentIndex: 0,
  vehicleName: 'Brizo',
  totalDistance: '7.2km',
  bottomDepth: '100-180m',
  duration: '6hrs',
  recentRuns: [
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
  ],
  onCancel: () => console.log('cancel'),
  onSchedule: () => console.log('scheduled'),
  parameters,
  safetyParams,
  commsParams,
  ...missionTableArgs,
  ...waypointTableArgs,
}

export const Mission = Template.bind({})
Mission.args = args

Mission.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=6574%3A889',
  },
}

export const Waypoint = Template.bind({})
Waypoint.args = { ...args, currentIndex: 1, selectedId: '1' }

Waypoint.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=6574%3A889',
  },
}

export const Parameter = Template.bind({})
Parameter.args = { ...args, currentIndex: 2, selectedId: '1' }

Parameter.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=6574%3A889',
  },
}

export const SafetyComms = Template.bind({})
SafetyComms.args = { ...args, currentIndex: 3, selectedId: '1' }

SafetyComms.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=6574%3A889',
  },
}

const reviewWaypoints = Array(3)
  .fill(0)
  .map((_, index) => ({
    latName: `Lat${index + 1}`,
    lonName: `Lon${index + 1}`,
    lat: `${33.333 + index}`,
    lon: `${-141.111 + index}`,
    stationName: `C${index + 1}`,
    description: `Latitude of ${makeOrdinal(
      index + 1
    )} waypoint. If NaN, waypoint
will be skipped/Longitude of ${makeOrdinal(index + 1)} waypoint.`,
  }))

export const Review = Template.bind({})
Review.args = {
  ...args,
  currentIndex: 4,
  selectedId: '1',
  waypoints: reviewWaypoints,
  commsParams: commsParams.map((param) => ({ ...param, overrideValue: '3' })),
}

Review.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=6574%3A889',
  },
}
