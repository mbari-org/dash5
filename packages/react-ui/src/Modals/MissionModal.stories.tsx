import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { MissionModal, MissionModalProps } from './MissionModal'
import { MissionTableProps } from '../Tables/MissionTable'

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
      category: 'Science: sci2',
      name: 'Test mission',
      description:
        "Vehicle yo-yo's to the specified waypoints, with science turned on.",
      vehicle: 'Brizo',
      ranBy: 'Jordan Caress',
      ranOn: 'Dec. 10, 2021',
      waypointCount: 2,
    },
    {
      id: '2',
      category: 'Science: sci2',
      name: 'Test mission',
      description:
        "Vehicle yo-yo's to the specified waypoints, with science turned on.",
      vehicle: 'Tethys',
      ranBy: 'Joost Daniels',
      ranOn: 'Dec. 10, 2021',
      waypointCount: 4,
    },
    {
      id: '3',
      category: 'Science: profile_station',
      name: 'Profile station at C1 for the night',
      description:
        'This mission yoyos in a circle around a specified location.',
      vehicle: 'Tethys',
      ranBy: 'Ben Ranaan',
      ranOn: 'Dec. 10, 2021',
      ranAt: 'C1',
    },
    {
      id: '4',
      category: 'Science: sci2',
      name: 'more okeanids testing',
      description:
        "Vehicle yo-yo's to the specified waypoints, with science turned on.",
      vehicle: 'Tethys',
      ranBy: 'Carlos Rueda',
      ranOn: 'Aug. 27, 2021',
      waypointCount: 2,
    },
    {
      id: '5',
      category: 'Science: esp_sample_at_depth',
      name: 'sending final doublet sampling mission',
      description: 'This mission takes ESP samples at the designated depth.',
      vehicle: 'Brizo',
      ranBy: 'Greg Doucette',
      ranOn: 'Aug. 16, 2021',
    },
    {
      id: '6',
      category: 'Maintenance: ballast_and_trim',
      name: 'running B&T until next sampling',
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

const args = {
  currentIndex: 0,
  vehicleName: 'Brizo',
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
  ...missionTableArgs,
}

export const Mission = Template.bind({})
Mission.args = args

Mission.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=6574%3A889',
  },
}
