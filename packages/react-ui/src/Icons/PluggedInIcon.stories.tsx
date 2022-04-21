import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { PluggedInIcon, PluggedInIconProps } from './PluggedInIcon'

export default {
  title: 'Icons/PluggedInIcon',
  component: PluggedInIcon,
} as Meta

const Template: Story<PluggedInIconProps> = (args) => (
  <PluggedInIcon {...args} />
)

const args: PluggedInIconProps = {
  className: 'fill-red-500',
}

export const Standard = Template.bind({})
Standard.args = args
