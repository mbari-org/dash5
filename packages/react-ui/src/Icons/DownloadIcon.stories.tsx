import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { DownloadIcon, DownloadIconProps } from './DownloadIcon'

export default {
  title: 'Icons/DownloadIcon',
  component: DownloadIcon,
} as Meta

const Template: Story<DownloadIconProps> = (args) => <DownloadIcon {...args} />

const args: DownloadIconProps = {
  className: 'stroke-teal-500 fill-red-200',
}

export const Standard = Template.bind({})
Standard.args = args
