import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { InProgressIcon, InProgressIconProps } from './InProgressIcon'

export default {
  title: 'Icons/InProgressIcon',
  component: InProgressIcon,
} as Meta

const Template: Story<InProgressIconProps> = (args) => (
  <InProgressIcon {...args} />
)

const args: InProgressIconProps = {
  className: 'stroke-stone-500 fill-transparent',
}

export const Standard = Template.bind({})
Standard.args = args
