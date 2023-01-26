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
    'Mission',
    'Waypoints',
    'Parameters',
    'Safety & comms',
    'Review',
    'Schedule',
  ],
  currentStepIndex: 0,
}

export const Standard = Template.bind({})
Standard.args = args

Standard.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=1407%3A508',
  },
}
