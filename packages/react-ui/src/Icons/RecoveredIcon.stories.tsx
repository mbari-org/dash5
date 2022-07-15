import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { RecoveredIcon, RecoveredIconProps } from './RecoveredIcon'

export default {
  title: 'Icons/RecoveredIcon',
  component: RecoveredIcon,
} as Meta

const Template: Story<RecoveredIconProps> = (args) => (
  <RecoveredIcon {...args} />
)

const args: RecoveredIconProps = {
  className: 'stroke-stone-500 fill-stone-500',
}

export const Standard = Template.bind({})
Standard.args = args
