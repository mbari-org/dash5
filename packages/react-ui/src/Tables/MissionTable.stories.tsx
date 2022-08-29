import React, { useState } from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { MissionTable, MissionTableProps } from './MissionTable'

export default {
  title: 'Tables/MissionTable',
  component: MissionTable,
  argTypes: {
    // controlled via state in Template
    selectedId: {
      control: {
        disable: true,
      },
    },
  },
} as Meta

const Template: Story<MissionTableProps> = (args) => {
  const [selection, setSelection] = useState(args.selectedId)

  return (
    <MissionTable
      {...args}
      onSelectMission={(id) => {
        args.onSelectMission?.(id)
        setSelection(id)
      }}
      selectedId={selection}
    />
  )
}

const args: MissionTableProps = {
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
  selectedId: '1',
}

export const Standard = Template.bind({})
Standard.args = args

Standard.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=3622%3A564',
  },
}
