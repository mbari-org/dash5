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
  onSelectMore: () => {
    console.log('event fired')
  },
  onSelect: () => {
    console.log('event fired')
  },
  onSelectMission: (id) => {
    console.log(`Selected mission ${id}`)
  },
  time: '16:29:32',
  date: 'Dec. 15, 2021',
  label: 'Maintenance Log - 8430279410327430174037149070',
  missions: [{ name: 'Brizo 7 EcoHAB', id: '1' }],
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
  missions: [
    { name: 'Brizo 7 EcoHAB', id: '1' },
    { name: 'Gup S Narwhal', id: '2' },
    { name: 'Gup C Sub', id: '3' },
    { name: 'Gup X Special', id: '4' },
  ],
}
MultipleTags.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=296%3A447',
  },
}
