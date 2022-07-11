import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { CommsCell, CommsCellProps } from './CommsCell'

export default {
  title: 'Cells/CommsCell',
  component: CommsCell,
} as Meta

const Template: Story<CommsCellProps> = (args) => (
  <div className="bg-stone-200 p-2" style={{ width: 438 }}>
    <CommsCell {...args} />
  </div>
)

const args: CommsCellProps = {
  className: '',
  command: 'sched “load Science/sci2.xml”',
  entry: 'Mission 12460798',
  name: 'Tanner Poling',
  description: 'Waiting to transmit',
  day: 'Today',
  time: '16:29',
  isUpload: true,
  isScheduled: true,
  onSelect: () => {
    console.log('event fired')
  },
}

export const Waiting = Template.bind({})
Waiting.args = args

Waiting.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=296%3A977',
  },
}

export const Scheduled = Template.bind({})
Scheduled.args = {
  ...args,
  command: 'sched asap “set \nprofile_station.MaxDepth \n150 m; run”',
  entry: 'Mission 1/2 12460795',
  name: 'Shannon Johnson',
  description: 'Ack. by Brizo',
  time: '14:32',
  isUpload: false,
}

Scheduled.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=297%3A1505',
  },
}

export const LongScheduled = Template.bind({})
LongScheduled.args = {
  ...args,
  command:
    'sched asap "load Science/sci2.xml;set sci2.MissionTimeout 10 min;set sci2.NeedCommsTime 45 min;set sci2.Lat1 34.378 degree;set sci2.Lon1 -119.737 degree;set sci2.Speed -2 m/s;set sci2.YoYoMaxDepth 20 m;set sci2.MaxDepth 40 m" 2mg2x 1 2\nsched asap "set sci2.MinOffshore 1 km;run" 2mg2x 2 2',
  entry: 'Mission 1/2 12460795',
  name: 'Shannon Johnson',
  description: 'Ack. by Brizo',
  time: '14:32',
  isUpload: false,
}

Scheduled.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=297%3A1505',
  },
}

export const Stopped = Template.bind({})
Stopped.args = {
  ...args,
  command: 'schedule clear; schedule \nresume',
  entry: 'Command 12460792',
  name: 'Shannon Johnson',
  description: 'Ack. by Brizo',
  time: '14:18',
  isUpload: false,
  isScheduled: false,
}

Stopped.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=298%3A1770',
  },
}
