import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { VehicleInfoCell, VehicleInfoCellProps } from './VehicleInfoCell'
import { UnderwaterIcon } from '../Icons/UnderwaterIcon'
import { SurfacedIcon } from '../Icons/SurfacedIcon'

export default {
  title: 'Cells/VehicleInfoCell',
  component: VehicleInfoCell,
} as Meta

const Template: Story<VehicleInfoCellProps> = (args) => (
  <div className="bg-stone-200 p-2">
    <VehicleInfoCell {...args} />
  </div>
)

const args: VehicleInfoCellProps = {
  icon: <UnderwaterIcon />,
  headline: 'Likely underwater',
  subtitle: 'Last confirmed on surface 47min ago',
  lastCommsOverSat: 'Today at 14:08:36 (47m ago)',
  estimate: 'Est. to surface in 15 mins at ~14:55',
  onSelect: () => {},
}

export const Underwater = Template.bind({})
Underwater.args = args
Underwater.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=1704%3A579',
  },
}

export const OnSurface = Template.bind({})
OnSurface.args = {
  ...args,
  icon: <SurfacedIcon className="fill-black stroke-black opacity-60" />,
  headline: 'Possibly on the surface',
  subtitle: 'Last confirmed on the surface 15min ago',
  lastCommsOverSat: 'Today at 14:40:36 (15m ago)',
  estimate: 'Est. to submerge in 2 minutes at ~14:41',
}
OnSurface.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=1704%3A534',
  },
}
