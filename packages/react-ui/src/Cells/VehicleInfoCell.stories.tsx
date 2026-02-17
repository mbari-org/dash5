import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { DateTime } from 'luxon'
import { VehicleInfoCell, VehicleInfoCellProps } from './VehicleInfoCell'

export default {
  title: 'Cells/VehicleInfoCell',
  component: VehicleInfoCell,
} as Meta

const Template: Story<VehicleInfoCellProps> = (args) => (
  <div className="bg-stone-200 p-2">
    <VehicleInfoCell {...args} />
  </div>
)

export const PluggedIn = Template.bind({})
PluggedIn.args = {
  isPluggedIn: true,
  lastPluggedInTime: DateTime.now().minus({ hours: 2 }),
  onSelect: () => {
    console.log('event fired')
  },
}
PluggedIn.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=1704%3A579',
  },
}

export const Surfaced = Template.bind({})
Surfaced.args = {
  isReachable: true,
  lastSatCommsTime: DateTime.now().minus({ minutes: 15 }),
  lastCellCommsTime: DateTime.now().minus({ minutes: 10 }),
  nextCommsTime: DateTime.now().plus({ minutes: 25 }),
  onSelect: () => {
    console.log('event fired')
  },
}
Surfaced.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6AI/MBARI-Components?node-id=1704%3A534',
  },
}

export const Underwater = Template.bind({})
Underwater.args = {
  isReachable: false,
  lastSatCommsTime: DateTime.now().minus({ hours: 1 }),
  nextCommsTime: DateTime.now().plus({ minutes: 30 }),
  onSelect: () => {
    console.log('event fired')
  },
}
Underwater.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=1704%3A579',
  },
}
