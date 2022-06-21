import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { CommandTable, CommandTableProps } from './CommandTable'

export default {
  title: 'Tables/CommandTable',
  component: CommandTable,
} as Meta

const Template: Story<CommandTableProps> = (args) => <CommandTable {...args} />

const args: CommandTableProps = {
  commands: [
    {
      id: '1',
      name: 'restart logs',
      vehicle: 'Brizo',
      description: 'Restart, from least impact (logs) to most impact (system)',
    },
    {
      id: '2',
      name: 'stop',
      vehicle: 'Tethys',
      description: 'Stop currently running mission',
    },
    {
      id: '3',
      name: 'schedule clear; schedule resume',
      vehicle: 'Tethys',
      description: 'Schedule commands for later execution',
    },
    {
      id: '4',
      name: 'restart app',
      vehicle: 'Tethys',
      description: 'Restart, from least impact (logs) to most impact (system)',
    },
    {
      id: '5',
      name: 'configSet CTD_Seabird.loadAtStartup 1 bool persist;',
      vehicle: 'Brizo',
      description: 'Set configuration variable value',
    },
    {
      id: '6',
      name: 'configSet list',
      vehicle: 'Brizo',
      description: 'Set configuration variable value',
    },
    {
      id: '7',
      name: 'strobe off',
      vehicle: 'Brizo',
      description: 'Enable (or disable) the strobe',
    },
    {
      id: '8',
      name: 'ibit',
      vehicle: 'Brizo',
      description: 'Run initiated built in test',
    },
  ],
  onSelectCommand: (id) => {
    console.log(`id: ${id}`)
  },
  onSortColumn: (col, isAsc) => {
    console.log(
      `Clicked column number ${col}, which is sorted ${
        isAsc ? 'ascending' : 'descending'
      }`
    )
  },
  selectedId: '1',
}

export const Standard = Template.bind({})
Standard.args = args
Standard.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=5563%3A635',
  },
}
