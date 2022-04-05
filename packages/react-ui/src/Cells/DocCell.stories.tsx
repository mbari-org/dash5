import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { DocCell, DocCellProps } from './DocCell'

export default {
  title: 'Cells/DocCell',
  component: DocCell,
} as Meta

const Template: Story<DocCellProps> = (args) => (
  <div className="bg-stone-200 p-2">
    <DocCell {...args} />
  </div>
)

const args: DocCellProps = {
  className: '',
  onSelectMore: () => {},
  onSelect: () => {},
  onSelectMission: (id) => {},
  time: '16:29:32',
  date: 'Dec. 15, 2021',
  label: 'Maintenance Log - Brizo',
  missions: [
    { name: 'Brizo 7 EcoHAB', id: '1' },
    { name: 'Gup S EcoHAB', id: '2' },
    { name: 'Gup S EcoHAB', id: '2' },
    { name: 'Gup S EcoHAB', id: '2' },
  ],
}

export const Standard = Template.bind({})
Standard.args = args
Standard.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=296%3A447',
  },
}
