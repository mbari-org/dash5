import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { SubIcon, SubIconProps } from './SubIcon'

export default {
  title: 'Icons/SubIcon',
  component: SubIcon,
} as Meta

const Template: Story<SubIconProps> = (args) => <SubIcon {...args} />

const args: SubIconProps = {
  className: 'stroke-stone-500 fill-stone-500',
}

export const Standard = Template.bind({})
Standard.args = args
