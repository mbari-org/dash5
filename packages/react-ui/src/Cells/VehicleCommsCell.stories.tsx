import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { VehicleCommsCell, VehicleCommsCellProps } from './VehicleCommsCell'
import { ConnectedIcon } from '../Icons/ConnectedIcon'
import { NotConnectedIcon } from '../Icons/NotConnectedIcon'

export default {
  title: 'Cells/VehicleCommsCell',
  component: VehicleCommsCell,
} as Meta

const Template: Story<VehicleCommsCellProps> = (args) => (
  <div className="bg-stone-200 p-2">
    <VehicleCommsCell {...args} />
  </div>
)

const args: VehicleCommsCellProps = {
  icon: <ConnectedIcon />,
  headline: 'Cell Comms: Connected',
  host: 'lrauv-brizo-cell.shore.mbari.org',
  lastPing: 'Today at 14:40:36 (3s ago)',
  nextComms: '14:55 (in 15m)',
  onSelect: () => {},
}

export const Connected = Template.bind({})
Connected.args = args
Connected.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=1704%3A552',
  },
}

export const NotConnected = Template.bind({})
NotConnected.args = {
  ...args,
  icon: <NotConnectedIcon />,
  headline: 'Cell Comms: Not connected',
  lastPing: 'Today at 11:40:36 (1h 5m ago)',
}
NotConnected.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=1704%3A606',
  },
}
