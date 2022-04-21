import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { UploadIcon, UploadIconProps } from './UploadIcon'

export default {
  title: 'Icons/UploadIcon',
  component: UploadIcon,
} as Meta

const Template: Story<UploadIconProps> = (args) => <UploadIcon {...args} />

const args: UploadIconProps = {
  className: 'stroke-purple-500 fill-green-300',
}

export const Standard = Template.bind({})
Standard.args = args
