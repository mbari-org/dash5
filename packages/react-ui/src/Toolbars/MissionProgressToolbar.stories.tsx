import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import {
  MissionProgressToolbar,
  MissionProgressToolbarProps,
} from './MissionProgressToolbar'
import { DateTime } from 'luxon'
export default {
  title: 'Toolbars/MissionProgressToolbar',
  component: MissionProgressToolbar,
} as Meta

const Template: Story<MissionProgressToolbarProps> = (args) => (
  <div className="bg-secondary-100">
    <MissionProgressToolbar {...args} />
  </div>
)

const args: MissionProgressToolbarProps = {
  className: '',
  ariaLabel: 'Mission Progress Toolbar',
  ticks: 5,
  startTime: DateTime.local().minus({ days: 3, hours: 7 }).toISO(),
  endTime: DateTime.local().plus({ days: 1, hours: 3 }).toISO(),
  indicatorTime: DateTime.local().minus({ days: 2, hours: 7 }).toMillis(),
}

export const Standard = Template.bind({})
Standard.args = args
Standard.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=1%3A599',
  },
}

export const LotsOfTicks = Template.bind({})
LotsOfTicks.args = { ...args, ticks: 10 }
LotsOfTicks.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=1%3A599',
  },
}

export const FewTicks = Template.bind({})
FewTicks.args = { ...args, ticks: 2 }
FewTicks.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=1%3A599',
  },
}

export const NoTicks = Template.bind({})
NoTicks.args = { ...args, ticks: 0 }
NoTicks.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=1%3A599',
  },
}

export const HasNotStarted = Template.bind({})
HasNotStarted.args = {
  ...args,
  startTime: DateTime.local().plus({ days: 3, hours: 7 }).toISO(),
  endTime: DateTime.local().plus({ days: 5, hours: 3 }).toISO(),
}
HasNotStarted.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=1%3A599',
  },
}

export const HasEnded = Template.bind({})
HasEnded.args = {
  ...args,
  startTime: DateTime.local().minus({ days: 5, hours: 7 }).toISO(),
  endTime: DateTime.local().minus({ days: 3, hours: 3 }).toISO(),
}
HasEnded.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=1%3A599',
  },
}

export const HasEndedLongAgo = Template.bind({})
HasEndedLongAgo.args = {
  ...args,
  startTime: DateTime.local().minus({ months: 5, hours: 7 }).toISO(),
  endTime: DateTime.local().minus({ months: 3, hours: 3 }).toISO(),
}
HasEnded.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=1%3A599',
  },
}
