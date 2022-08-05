import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { DocCell, DocCellProps } from './DocCell'

export default {
  title: 'Cells/DocCell',
  component: DocCell,
} as Meta

const Template: Story<DocCellProps> = (args) => (
  <div className="w-[430px] bg-stone-200 p-2">
    <DocCell {...args} />
  </div>
)

const args: DocCellProps = {
  className: '',
  onSelect: () => {
    console.log('event fired')
  },
  onSelectAttachment: (attachment) => {
    console.log(`Selected attachment ${attachment}`)
  },
  onMoreClick: (data, rect) => {
    console.log('More Clicked', data, rect)
  },
  docId: 1,
  docInstanceId: 100,
  time: '16:29:32',
  date: 'Dec. 15, 2021',
  label: 'Maintenance Log - 8430279410327430174037149070',
  attachments: [{ name: 'Brizo', id: 'Brizo', type: 'vehicle' }],
}

export const Standard = Template.bind({})
Standard.args = args
Standard.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=296%3A447',
  },
}

export const MultipleTags = Template.bind({})
MultipleTags.args = {
  ...args,
  attachments: [
    { name: 'Brizo 7 EcoHAB', id: 1, type: 'deployment' },
    { name: 'Gup S Narwhal', id: 2, type: 'deployment' },
    { name: 'Gup C Sub', id: 3, type: 'deployment' },
    { name: 'Gup X Special', id: 4, type: 'deployment' },
  ],
}
MultipleTags.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=296%3A447',
  },
}
