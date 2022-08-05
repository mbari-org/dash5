import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { Spinner, SpinnerProps } from './Spinner'

export default {
  title: 'Indicators/Spinner',
  component: Spinner,
} as Meta

const Template: Story<SpinnerProps> = (args) => <Spinner {...args} />

const args: SpinnerProps = {}

export const Standard = Template.bind({})
Standard.args = args

const InContainerTemplate: Story<SpinnerProps> = (args) => (
  <div className="flex rounded bg-slate-200 p-8">
    <Spinner {...args} />
  </div>
)

export const InFlexContainer = InContainerTemplate.bind({})
InFlexContainer.args = { ...args, className: 'my-auto ml-auto', size: '4x' }
