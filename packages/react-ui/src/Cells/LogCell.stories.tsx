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

export const WithJSX = Template.bind({})
WithJSX.args = {
  ...args,
  log: (
    <div className="flex flex-col">
      <p>
        ACK command Id: {23456788}, index: 3{' '}
        <span className="font-mono">
          Received command id: 16317778, index: 0, configSet
          PAR_Licor.loadAtStartup 1 bool persist;
        </span>
        , name: brizo_16341678.sbd, bytes: 40
      </p>
    </div>
  ),
}
WithJSX.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=294%3A442',
  },
}
