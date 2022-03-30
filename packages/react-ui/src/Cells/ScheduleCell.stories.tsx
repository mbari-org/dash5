import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { ScheduleCell, ScheduleCellProps } from './ScheduleCell'

export default {
  title: 'ScheduleCell',
  component: ScheduleCell,
} as Meta

const Template: Story<ScheduleCellProps> = (args) => <ScheduleCell {...args} />

const args: ScheduleCellProps = {
  className: '',
}

export const Scheduled = Template.bind({})
Scheduled.args = args
Scheduled.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=289%3A210',
  },
}

export const Running = Template.bind({})
Running.args = args
Running.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=289%3A211',
  },
}

export const Ended = Template.bind({})
Ended.args = args
Ended.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=290%3A611',
  },
}

export const Executed = Template.bind({})
Executed.args = args
Executed.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=290%3A495',
  },
}

export const Paused = Template.bind({})
Paused.args = args
Paused.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=291%3A231',
  },
}
