import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { ScheduleCell, ScheduleCellProps } from './ScheduleCell'

export default {
  title: 'Cells/ScheduleCell',
  component: ScheduleCell,
} as Meta

const Template: Story<ScheduleCellProps> = (args) => (
  <div className="bg-stone-200 p-2">
    <ScheduleCell {...args} />
  </div>
)

const args: ScheduleCellProps = {
  className: '',
  status: 'pending',
  label: 'ESP sample at depth',
  secondary: 'Deeper sample',
  name: 'Reiko Michisaki',
  description: 'Today',
  onSelect: () => {
    console.log('event fired')
  },
  onSelectMore: () => {
    console.log('event fired')
  },
}

export const Scheduled = Template.bind({})
Scheduled.args = {
  ...args,
  scheduleStatus: 'paused',
  description2: '23:00-00:59',
}
Scheduled.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=289%3A210',
  },
}

export const Running = Template.bind({})
Running.args = {
  ...args,
  status: 'running',
  label: 'Profile Station',
  secondary: 'One more time',
  description: 'Started at 14:30',
  description2: 'Running for 12min',
  description3: 'Ending ~22:59',
  scheduleStatus: 'running',
}
Running.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=289%3A211',
  },
}

export const Ended = Template.bind({})
Ended.args = {
  ...args,
  status: 'cancelled',
  secondary: 'Per YZ shallow sample',
  description: 'Ended at 10:22',
  description2: '3 hours ago',
  description3: '2h 14m runtime',
}
Ended.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=290%3A611',
  },
}

export const Executed = Template.bind({})
Executed.args = {
  ...args,
  status: 'completed',
  label: 'resume',
  secondary: 'fixed it',
  description: 'Executed at 11:32',
  description2: '86 min ago',
}
Executed.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=290%3A495',
  },
}

export const Paused = Template.bind({})
Paused.args = {
  ...args,
  status: 'paused',
  scheduleStatus: 'paused',
  description: 'Paused',
  description2: 'Est. runtime 1h 59m',
}
Paused.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=291%3A231',
  },
}
