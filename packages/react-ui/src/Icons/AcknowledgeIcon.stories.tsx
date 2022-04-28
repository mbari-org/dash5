import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { AcknowledgeIcon, AcknowledgeIconProps } from './AcknowledgeIcon'

export default {
  title: 'Icons/AcknowledgeIcon',
  component: AcknowledgeIcon,
} as Meta

const Template: Story<AcknowledgeIconProps> = (args) => (
  <AcknowledgeIcon {...args} />
)

const args: AcknowledgeIconProps = {
  className: 'stroke-stone-500 fill-white',
}

export const Standard = Template.bind({})
Standard.args = args
