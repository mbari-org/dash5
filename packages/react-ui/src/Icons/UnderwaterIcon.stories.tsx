import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { UnderwaterIcon, UnderwaterIconProps } from './UnderwaterIcon'

export default {
  title: 'Icons/UnderwaterIcon',
  component: UnderwaterIcon,
} as Meta

const Template: Story<UnderwaterIconProps> = (args) => (
  <UnderwaterIcon {...args} />
)

const args: UnderwaterIconProps = {
  className: 'stroke-pink-500 fill-pink-500',
}

export const Standard = Template.bind({})
Standard.args = args
