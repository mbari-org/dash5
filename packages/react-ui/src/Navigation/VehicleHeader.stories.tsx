import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { VehicleHeader, VehicleHeaderProps } from './VehicleHeader'
import { DateTime } from 'luxon'

export default {
  title: 'Navigation/VehicleHeader',
  component: VehicleHeader,
} as Meta

const Template: Story<VehicleHeaderProps> = (args) => (
  <VehicleHeader {...args} />
)

const args: VehicleHeaderProps = {
  name: 'Brizo',
  deployment: 'Brizo 7 Ecohab',
  color: '#00ff00',
  onToggle: () => undefined,
  open: false,
  deployedAt: DateTime.now().minus({ days: 3, hours: 4 }).toSeconds(),
}

export const Standard = Template.bind({})
Standard.args = args
Standard.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=5399%3A613',
  },
}
