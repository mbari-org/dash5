import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { ErrorList, ErrorListProps } from './ErrorList'

export default {
  title: 'Fields/ErrorList',
  component: ErrorList,
} as Meta

const Template: Story<ErrorListProps> = (args) => (
  <div className="flex bg-gray-100 bg-opacity-25 p-4">
    <ErrorList {...args} />
  </div>
)

export const Default = Template.bind({})
Default.args = {
  errors: {
    name: { message: 'is blank' },
    cannot_occur_on: { message: 'must be a date' },
  },
}
