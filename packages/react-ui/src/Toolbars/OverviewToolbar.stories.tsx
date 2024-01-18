import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { VehicleCommsCell, VehicleInfoCell } from '../Cells'
import { OverviewToolbar, OverviewToolbarProps } from './OverviewToolbar'
import { faEye } from '@fortawesome/free-regular-svg-icons'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { ConnectedIcon, UnderwaterIcon, CommsIcon, StatusIcon } from '../Icons'
import { DateTime } from 'luxon'

export default {
  title: 'Toolbars/OverviewToolbar',
  component: OverviewToolbar,
} as Meta

const Template: Story<OverviewToolbarProps> = (args) => (
  <div className="bg-stone-200 p-2">
    <OverviewToolbar {...args} />
  </div>
)

const args: OverviewToolbarProps = {
  className: '',
  deployment: {
    name: 'Brizo 7 EcoHab',
    id: '1',
    unixTime: DateTime.now().minus({ days: 3 }).toMillis(),
  },
  pilotInCharge: 'Tanner P. (you)',
  pilotOnCall: 'Brian K.',
  btnIcon: faEye as IconDefinition,
  open: false,
  supportIcon1: <CommsIcon />,
  supportIcon2: <StatusIcon />,
  deployments: [
    {
      id: '1',
      name: 'Brizo 7 Ecohab',
    },
    {
      id: '2',
      name: 'Brizo 23 MBTS',
    },
    {
      id: '2',
      name: 'Brizo 114 MBTS',
    },
    {
      id: '2',
      name: 'Brizo 16 BioAC',
    },
  ],
  onSelectNewDeployment() {
    console.log('New deployment for Brizo')
  },
  onSelectDeployment(deployment) {
    console.log(deployment)
  },
  onEditDeployment: () => {
    console.log('event fired')
  },
  onClickPilot: () => {
    console.log('event fired')
  },
  onIcon1hover: () => (
    <VehicleCommsCell
      icon={<ConnectedIcon />}
      headline="Cell Comms: Connected"
      host="lrauv-brizo-cell.shore.mbari.org"
      lastPing="Today at 14:40:36 (3s ago)"
      nextComms="14:55 (in 15m)"
      onSelect={() => {
        console.log('event fired')
      }}
    />
  ),
  onIcon2hover: () => (
    <VehicleInfoCell
      icon={<UnderwaterIcon />}
      headline="Likely underwater"
      subtitle="Last confirmed on surface 47min ago"
      lastCommsOverSat="Today at 14:08:36 (47m ago)"
      estimate="Est. to surface in 15 mins at ~14:55"
      onSelect={() => {
        console.log('event fired')
      }}
    />
  ),
  vehicleName: 'Brizo',
}

export const Standard = Template.bind({})
Standard.args = args
Standard.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=1294%3A494',
  },
}

export const Overview = Template.bind({})
Overview.args = {
  ...args,
  deployment: { name: 'Overview', id: '0' },
  onSelectDeployment: undefined,
  onSelectNewDeployment: undefined,
  onEditDeployment: undefined,
  onIcon1hover: undefined,
  onIcon2hover: undefined,
}
Overview.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=1294%3A494',
  },
}
