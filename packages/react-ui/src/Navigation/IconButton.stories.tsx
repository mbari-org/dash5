import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { IconButton, IconButtonProps } from './IconButton'
import { faHomeLgAlt } from '@fortawesome/pro-duotone-svg-icons'

export default {
  title: 'Navigation/IconButton',
  component: IconButton,
} as Meta

const Template: Story<IconButtonProps> = (args) => <IconButton {...args} />

const args: IconButtonProps = {
  className: '',
  icon: faHomeLgAlt,
  ariaLabel: 'Home',
}

export const Standard = Template.bind({})
Standard.args = args

export const ExtraSmall = Template.bind({})
ExtraSmall.args = { ...args, size: 'text-xs' }

export const Small = Template.bind({})
Small.args = { ...args, size: 'text-sm' }

export const Medium = Template.bind({})
Medium.args = { ...args, size: 'text-md' }

export const Large = Template.bind({})
Large.args = { ...args, size: 'text-lg' }

export const XL = Template.bind({})
XL.args = { ...args, size: 'text-xl' }

export const TwoXL = Template.bind({})
TwoXL.args = { ...args, size: 'text-2xl' }
