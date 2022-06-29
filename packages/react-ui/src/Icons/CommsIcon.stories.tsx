import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { CommsIcon, CommsIconProps } from './CommsIcon'

export default {
  title: 'Icons/CommsIcon',
  component: CommsIcon,
} as Meta

const Template: Story<CommsIconProps> = (args) => <CommsIcon {...args} />

const args: CommsIconProps = {}

export const Standard = Template.bind({})
Standard.args = args
