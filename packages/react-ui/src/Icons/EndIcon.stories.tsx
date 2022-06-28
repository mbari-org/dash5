import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { EndIcon, EndIconProps } from './EndIcon'

export default {
  title: 'Icons/EndIcon',
  component: EndIcon,
} as Meta

const Template: Story<EndIconProps> = (args) => <EndIcon {...args} />

const args: EndIconProps = {
  className: 'stroke-stone-500',
}

export const Standard = Template.bind({})
Standard.args = args
