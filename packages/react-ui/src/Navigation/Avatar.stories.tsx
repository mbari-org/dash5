import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import avatarSrc from './AvatarGiphy.gif'
import { Avatar, AvatarProps } from './Avatar'

export default {
  title: 'Navigation/Avatar',
  component: Avatar,
} as Meta

const Template: Story<AvatarProps> = (args) => <Avatar {...args} />

const args: AvatarProps = {
  name: 'John Appleseed',
  color: '#e7ab48',
}

export const Standard = Template.bind({})
Standard.args = args

export const WithImage = Template.bind({})
WithImage.args = { ...args, imageUrl: avatarSrc }
