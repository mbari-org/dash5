import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { VehicleCommsCell, VehicleCommsCellProps } from './VehicleCommsCell'
import { ConnectedIcon } from '../Icons/ConnectedIcon'

const notConnectedIcon = (
  <svg
    width="26"
    height="26"
    viewBox="0 0 26 26"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g opacity="0.5">
      <path
        d="M17.1381 25H8.86175C8.15838 25 7.67481 24.2931 7.92974 23.6375L12.9999 10.6L18.0701 23.6375C18.325 24.2931 17.8414 25 17.1381 25Z"
        stroke="black"
        strokeWidth="2"
      />
      <ellipse cx="13.0001" cy="7.1714" rx="2.4" ry="2.05714" fill="black" />
      <path
        d="M18.6001 3.7428L18.9101 4.80565C19.2301 5.9028 19.2301 7.06851 18.9101 8.16565L18.6001 9.22851"
        stroke="black"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M18.6001 3.7428L18.9101 4.80565C19.2301 5.9028 19.2301 7.06851 18.9101 8.16565L18.6001 9.22851"
        stroke="black"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M7.3999 9.22852L7.0899 8.16566C6.7699 7.06852 6.7699 5.9028 7.0899 4.80566L7.3999 3.7428"
        stroke="black"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M23.3999 1L24.3674 3.90263C24.778 5.13424 24.778 6.46577 24.3674 7.69737L23.3999 10.6"
        stroke="black"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M2.6001 10.6L1.63255 7.69734C1.22202 6.46574 1.22202 5.13421 1.63255 3.90261L2.6001 0.999975"
        stroke="black"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </g>
    <path d="M1 1L25 25" stroke="black" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

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
  icon: notConnectedIcon,
  headline: 'Cell Comms: Not connected',
  lastPing: 'Today at 11:40:36 (1h 5m ago)',
}
NotConnected.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=1704%3A606',
  },
}
