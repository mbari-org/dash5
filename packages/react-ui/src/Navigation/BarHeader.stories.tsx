import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { BarHeader, BarHeaderProps } from './BarHeader'

export default {
  title: 'Navigation/Bar Header',
  component: BarHeader,
} as Meta

const Template: Story<BarHeaderProps> = (args) => <BarHeader {...args} />

const args = {
  primary: 'Heading Title',
}

export const Standard = Template.bind({})
Standard.args = args

export const WithSecondary = Template.bind({})
WithSecondary.args = { ...args, secondary: 'A descriptive subtitle...' }
