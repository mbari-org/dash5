import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { StartIcon, StartIconProps } from './StartIcon'

export default {
  title: 'Icons/StartIcon',
  component: StartIcon,
} as Meta

const Template: Story<StartIconProps> = (args) => <StartIcon {...args} />

const args: StartIconProps = {
  className: 'stroke-stone-500',
}

export const Standard = Template.bind({})
Standard.args = args
