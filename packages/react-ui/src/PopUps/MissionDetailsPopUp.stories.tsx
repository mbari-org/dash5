import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import {
  MissionDetailsPopUp,
  MissionDetailsPopUpProps,
} from './MissionDetailsPopUp'

export default {
  title: 'PopUps/MissionDetailsPopUp',
  component: MissionDetailsPopUp,
} as Meta

const Template: Story<MissionDetailsPopUpProps> = (args) => (
  <MissionDetailsPopUp {...args} />
)

const args: MissionDetailsPopUpProps = {
  overrides: [
    {
      headerLabel: 'MISSION OVERRIDES',
      values: [
        { name: 'Repeat', value: '3 counts' },
        { name: 'YoYoMaxDepth', value: '80 meters' },
      ],
    },
    {
      headerLabel: 'SAFETY/COMMS OVERRIDES',
      values: [
        { name: 'MaxDepth', value: '150 meters' },
        { name: 'MinAltitude', value: '20 meters' },
      ],
    },
  ],
  missionDetails: [
    { name: 'Total mission time', value: '9 hours 20 minutes' },
    { name: 'Time in transit', value: '4 hours' },
    { name: 'Travel distance', value: '7.2km over 3 waypoints' },
    { name: 'Bottom depth', value: '100 to 180 meters' },
  ],

  missionId: 1,
  missionStatus: 'waiting',
  missionName: 'sci2',
  commandName: 'circles!',
  queue: 'Today at 16:29:14 by Tanner Poling',
  vehicle: 'Brizo',
  onLog: (missionId) => {
    console.log(missionId)
  },
}

export const Waiting = Template.bind({})
Waiting.args = {
  ...args,
  startTime: 'Today at 21:00',
  endTime: 'Tomorrow at 06:30',
}
Waiting.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=2853%3A738',
  },
}
export const InProgress = Template.bind({})
InProgress.args = {
  ...args,
  missionName: 'Profile station',
  commandName: 'One more time',
  startTime: 'Today at 14:30',
  endTime: 'Today at 22:59',
  missionStatus: 'in progress',
  queue: 'Today at 14:26:11 by Reiko Michisaki',
  transmission: '12kb completed at 14:28:53',
  acknowledge: 'Today at 14:30:08',
  missionDetails: [
    { name: 'Total mission time', value: '12 minutes of 6h 10m' },
    { name: 'Time in transit', value: '1.5 of 4 hours complete' },
    { name: 'Travel distance', value: '3.6 of 7.2km complete' },
    { name: 'Bottom depth', value: '100 to 180 meters' },
  ],
  overrides: [
    {
      headerLabel: 'MISSION OVERRIDES',
      values: [
        { name: 'YoYoMaxDepth', value: '40 meters' },
        { name: 'Radius', value: '200 meters' },
      ],
    },
    {
      headerLabel: 'SAFETY/COMMS OVERRIDES',
      values: [
        { name: 'MissionTimeout', value: '9 hours' },
        { name: 'NeedCommsTime', value: '30 minutes' },
      ],
    },
  ],
}
InProgress.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=2853%3A615',
  },
}

export const Completed = Template.bind({})
Completed.args = {
  ...args,
  missionName: 'Profile station',
  commandName: 'Per YZ, rerun PS',
  completeTime: '86 minutes ago',
  missionStatus: 'completed',
  queue: 'Today at 14:26:11 by Reiko Michisaki',
  transmission: '12kb completed at 14:28:53',
  acknowledge: 'Today at 14:30:08',
  missionDetails: [
    { name: 'Total mission time', value: '3 hours 5 minutes' },
    { name: 'Time in transit', value: '2 hours 42 minutes' },
    { name: 'Travel distance', value: '2km over 4 waypoints' },
    { name: 'Bottom depth range', value: '100 to 180 meters' },
  ],
  overrides: [
    {
      headerLabel: 'MISSION OVERRIDES',
      values: [{ name: 'YoYoMaxDepth', value: '40 meters' }],
    },
    {
      headerLabel: 'SAFETY/COMMS OVERRIDES',
      values: [
        { name: 'MissionTimeout', value: '9 hours' },
        { name: 'NeedCommsTime', value: '30 minutes' },
      ],
    },
  ],
}
Completed.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=2853%3A547',
  },
}
