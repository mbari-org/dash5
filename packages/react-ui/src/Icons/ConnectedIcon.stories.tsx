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
  className: 'text-stone-500 stroke-stone-500 fill-transparent',
}

export const Standard = Template.bind({})
Standard.args = args
