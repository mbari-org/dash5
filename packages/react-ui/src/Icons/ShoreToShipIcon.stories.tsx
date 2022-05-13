import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { ShoreToShipIcon, ShoreToShipIconProps } from './ShoreToShipIcon'

export default {
  title: 'Icons/ShoreToShipIcon',
  component: ShoreToShipIcon,
} as Meta

const Template: Story<ShoreToShipIconProps> = (args) => (
  <ShoreToShipIcon {...args} />
)

const args: ShoreToShipIconProps = {
  className: 'stroke-stone-500 fill-white',
}

export const Standard = Template.bind({})
Standard.args = args

export const Waiting = Template.bind({})
Waiting.args = { ...args, waiting: true }
