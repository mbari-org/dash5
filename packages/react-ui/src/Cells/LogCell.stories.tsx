import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { LogCell, LogCellProps } from './LogCell'

export default {
  title: 'Cells/LogCell',
  component: LogCell,
} as Meta

const Template: Story<LogCellProps> = (args) => (
  <div className="bg-stone-200 p-2">
    <LogCell {...args} />
  </div>
)

const args: LogCellProps = {
  className: '',
  label: 'Important',
  time: '16:18:53',
  date: '2020-07-21',
  log: `Got command configSet\nPAR_licor.loadAtStartup 1 bool persist;`,
  isUpload: true,
  onSelect: () => {
    console.log('event fired')
  },
}

export const Standard = Template.bind({})
Standard.args = args
Standard.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=294%3A442',
  },
}
