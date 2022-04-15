import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { StepProgress, StepProgressProps } from './StepProgress'

export default {
  title: 'Navigation/StepProgress',
  component: StepProgress,
} as Meta

const Template: Story<StepProgressProps> = (args) => (
  <div className="bg-stone-200 p-2">
    <StepProgress {...args} />
  </div>
)

const args: StepProgressProps = {
  className: '',
  steps: [
    { id: '1', title: 'Mission', inProgress: true },
    { id: '2', title: 'Waypoints', inProgress: false },
    { id: '3', title: 'Parameters', inProgress: false },
    { id: '4', title: 'Safety & comms', inProgress: false },
    { id: '5', title: 'Review', inProgress: false },
    { id: '6', title: 'Schedule', inProgress: false },
  ],
}

export const Standard = Template.bind({})
Standard.args = args

Standard.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=1407%3A508',
  },
}
