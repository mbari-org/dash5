import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { StatusIcon, StatusIconProps } from './StatusIcon'

export default {
  title: 'Icons/StatusIcon',
  component: StatusIcon,
} as Meta

const Template: Story<StatusIconProps> = (args) => <StatusIcon {...args} />

const args: StatusIconProps = {}

export const Standard = Template.bind({})
Standard.args = args
