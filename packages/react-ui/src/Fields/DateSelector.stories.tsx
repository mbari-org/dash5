import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { DateSelector, DateSelectorProps } from './DateSelector'

export default {
  title: 'Fields/DateSelector',
  component: DateSelector,
} as Meta

const Template: Story<DateSelectorProps> = (args) => (
  <div className="bg-contentAreaBackgroundAlt flex p-4">
    <DateSelector {...args} />
  </div>
)

export const Default = Template.bind({})
Default.args = {}

export const WithInitialDate = Template.bind({})
WithInitialDate.args = {
  initialDate: '2009-08-12T00:23:27.909Z',
}

export const WithSelectedDate = Template.bind({})
WithSelectedDate.args = {
  initialDate: '2009-08-12T00:23:27.909Z',
  selectedDate: '2009-08-12T00:23:27.909Z',
}
