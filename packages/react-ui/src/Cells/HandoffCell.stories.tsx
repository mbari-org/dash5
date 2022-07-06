import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { HandoffCell, HandoffCellProps } from './HandoffCell'

export default {
  title: 'Cells/HandoffCell',
  component: HandoffCell,
} as Meta

const Template: Story<HandoffCellProps> = (args) => (
  <div
    className="divide-y divide-slate-200 border border-slate-200"
    style={{
      maxWidth: 480,
    }}
  >
    <HandoffCell {...args} />
    <HandoffCell {...args} />
    <HandoffCell {...args} />
  </div>
)

const args: HandoffCellProps = {
  date: '2022-07-04T18:24:22.321Z',
  note: 'Mostly looks good, but keep an eye out. Brizo had some compass problems...',
  pilot: 'Shannon Johnson',
  warning: false,
  pic: false,
  selectable: true,
}

export const Standard = Template.bind({})
Standard.args = args
Standard.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=6410%3A771',
  },
}

export const StandardUnread = Template.bind({})
StandardUnread.args = { ...args, unread: true }
StandardUnread.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=6410%3A771',
  },
}

export const NonSelectable = Template.bind({})
NonSelectable.args = {
  ...args,
  selectable: false,
}
NonSelectable.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=6410%3A771',
  },
}

export const NonSelectableUnread = Template.bind({})
NonSelectableUnread.args = {
  ...args,
  selectable: false,
  unread: true,
}
NonSelectableUnread.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=6410%3A771',
  },
}

export const PicUnread = Template.bind({})
PicUnread.args = {
  ...args,
  selectable: false,
  unread: true,
  pic: true,
  note: 'took over PIC from Monique Messier.',
}
PicUnread.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=6410%3A771',
  },
}

export const PicUnreadSelectable = Template.bind({})
PicUnreadSelectable.args = {
  ...args,
  selectable: true,
  unread: true,
  pic: true,
  note: 'took over PIC from Monique Messier.',
}
PicUnreadSelectable.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=6410%3A771',
  },
}
