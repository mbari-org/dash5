import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { SurfacedIcon, SurfacedIconProps } from './SurfacedIcon'

export default {
  title: 'Icons/SurfacedIcon',
  component: SurfacedIcon,
} as Meta

const Template: Story<SurfacedIconProps> = (args) => <SurfacedIcon {...args} />

const args: SurfacedIconProps = {
  className: 'fill-red-500 stroke-red-500',
}

export const Standard = Template.bind({})
Standard.args = args
