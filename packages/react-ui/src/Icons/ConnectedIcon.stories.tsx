import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { ConnectedIcon, ConnectedIconProps } from './ConnectedIcon'

export default {
  title: 'Icons/ConnectedIcon',
  component: ConnectedIcon,
} as Meta

const Template: Story<ConnectedIconProps> = (args) => (
  <ConnectedIcon {...args} />
)

const args: ConnectedIconProps = {
  className: 'text-purple-500 stroke-purple-500 fill-orange-200',
}

export const Standard = Template.bind({})
Standard.args = args
