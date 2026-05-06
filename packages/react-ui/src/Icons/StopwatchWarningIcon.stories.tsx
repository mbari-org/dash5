import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'
import {
  StopwatchWarningIcon,
  StopwatchWarningIconProps,
} from './StopwatchWarningIcon'

export default {
  title: 'Icons/StopwatchWarningIcon',
  component: StopwatchWarningIcon,
} as Meta

const Template: Story<StopwatchWarningIconProps> = (args) => (
  <StopwatchWarningIcon {...args} />
)

const args: StopwatchWarningIconProps = {
  // Pass the orange explicitly; default is currentColor (inherits from parent)
  color: 'rgb(255, 132, 59)',
}

export const Standard = Template.bind({})
Standard.args = args

export const Large = Template.bind({})
Large.args = { ...args, style: { fontSize: '3rem' } }
