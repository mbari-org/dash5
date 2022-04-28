import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { NotConnectedIcon, NotConnectedIconProps } from './NotConnectedIcon'

export default {
  title: 'Icons/NotConnectedIcon',
  component: NotConnectedIcon,
} as Meta

const Template: Story<NotConnectedIconProps> = (args) => (
  <NotConnectedIcon {...args} />
)

const args: NotConnectedIconProps = {
  className: 'text-stone-500 stroke-stone-500 fill-transparent',
}

export const Standard = Template.bind({})
Standard.args = args
