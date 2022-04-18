import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { VehicleCell, VehicleCellProps } from './VehicleCell'

import subGraphic from '../assets/subGraphic.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSync } from '@fortawesome/pro-light-svg-icons'
import { faCheck } from '@fortawesome/pro-regular-svg-icons'
import { IconProp } from '@fortawesome/fontawesome-svg-core'

const subIcon = (
  <svg
    width="35"
    height="33"
    viewBox="0 0 35 33"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M4.5982 30.9281L5.64425 30.9191L27.3882 30.7303C29.7332 30.7099 31.425 29.7466 32.4368 28.2435C33.3634 26.8671 33.5626 25.2727 33.553 24.1472C33.5406 22.6845 32.884 21.1215 31.8915 19.9355C30.8774 18.7238 29.2923 17.6546 27.2776 17.6721L14.7532 17.7808L14.7189 13.7298L14.7019 11.7299L12.702 11.7473L9.70559 11.7733L7.70567 11.7907L7.72262 13.7906L7.75695 17.8415L5.53359 17.8608L4.48754 17.8699L3.89817 18.7343L0.791416 23.2908L0.00894842 24.4384L0.810749 25.5722L3.99427 30.0741L4.5982 30.9281ZM12.7533 17.7982L12.7702 19.7981L14.7702 19.7807L27.2945 19.672C29.8003 19.6502 31.5375 22.3224 31.5531 24.1645C31.5687 26.0067 30.8639 28.7 27.3713 28.7304L5.6273 28.9191L2.44378 24.4173L5.55054 19.8608L7.77389 19.8415L9.77382 19.8241L9.75687 17.8242L9.73949 15.7731L9.72254 13.7732L10.719 13.7646L11.7225 13.7559L12.719 13.7472L12.7359 15.7471L12.7533 17.7982Z"
      fill="#374151"
    />
    <path
      d="M19.4852 13.4583V12.4781L22.8602 8.2466V8.19121H19.596V6.9128H24.748V7.96535L21.5349 12.1244V12.1798H24.8588V13.4583H19.4852Z"
      fill="#374151"
    />
    <path
      d="M27.7102 9.69446V8.52969L32.4375 2.524V2.44446H27.8636V0.967185H34.5568V2.20582L30.0114 8.13764V8.21719H34.7159V9.69446H27.7102Z"
      fill="#374151"
    />
  </svg>
)

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
  icon: subIcon,
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
