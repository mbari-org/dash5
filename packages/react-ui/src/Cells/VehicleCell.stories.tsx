import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { VehicleCell, VehicleCellProps } from './VehicleCell'

import subGraphic from '../assets/subGraphic.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSync } from '@fortawesome/pro-light-svg-icons'
import { faCheck } from '@fortawesome/pro-regular-svg-icons'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { PluggedInIcon } from '../Icons/PluggedInIcon'

const syncIcon = (
  <FontAwesomeIcon icon={faSync as IconProp} className="text-xl" />
)

const checkIcon = (
  <FontAwesomeIcon icon={faCheck as IconProp} className="text-2xl" />
)

export default {
  title: 'Cells/VehicleCell',
  component: VehicleCell,
} as Meta

const Template: Story<VehicleCellProps> = (args) => (
  <div className="bg-stone-200 p-2">
    <VehicleCell {...args} />
  </div>
)

const args: VehicleCellProps = {
  icon: syncIcon,
  headline: (
    <div>
      Running{' '}
      <span className="font-semibold text-purple-600">Profile station</span> for
      12 minutes
    </div>
  ),
  onSelect: () => {},
}

export const Running = Template.bind({})
Running.args = {
  ...args,
  graphic: subGraphic,
  lastPosition: 'Tri_oid_2 36.797. -121847',
  lastSatellite: '15 minutes ago, next up in ~2.5 hours',
  lastCell: '2 days 3 hours ago',
}
Running.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=1703%3A544',
  },
}

export const PluggedIn = Template.bind({})
PluggedIn.args = {
  ...args,
  headline: (
    <div>
      <span className="font-semibold text-purple-600">Plugged in</span> for 17
      days 8 hours
    </div>
  ),
  headline2: (
    <div>
      Deployment{' '}
      <span className="font-semibold text-purple-600">Aku 14 Falkor leg 2</span>{' '}
      ended April 3, 2018
    </div>
  ),
  icon: <PluggedInIcon />,
  lastPosition: 'MBARI HQ, 36.797. -121.847',
  lastSatellite: '5 minutes ago, likely on surface',
  lastCell: '3 seconds ago',
}
PluggedIn.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=1704%3A505',
  },
}

export const Ended = Template.bind({})
Ended.args = {
  ...args,
  headline: (
    <div>
      Running{' '}
      <span className="font-semibold text-purple-600">default mission</span> for
      7 days 8 hours
    </div>
  ),
  headline2: (
    <div>
      Deployment{' '}
      <span className="font-semibold text-purple-600">Aku 14 Falkor leg 2</span>{' '}
      ended April 3, 2018
    </div>
  ),
  lastKnownGPS: '36.797. -121.847',
  lastCommunication: 'over cell, 15 seconds ago',
  icon: checkIcon,
}
Ended.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=1704%3A524',
  },
}
