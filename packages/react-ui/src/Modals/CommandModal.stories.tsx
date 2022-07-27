import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { CommandModal, CommandModalProps } from './CommandModal'
import { CommandTableProps } from '../Tables/CommandTable'

export default {
  title: 'Modals/CommandModal',
  component: CommandModal,
} as Meta

const Template: Story<CommandModalProps> = (args) => <CommandModal {...args} />

const commandTableArgs: CommandTableProps = {
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
    {
      id: '9',
      name: 'configSet CTD_Seabird.loadAtStartup 1 bool persist;',
      vehicle: 'Brizo',
      description: 'Set configuration variable value',
    },
    {
      id: '10',
      name: 'configSet list',
      vehicle: 'Brizo',
      description: 'Set configuration variable value',
    },
    {
      id: '11',
      name: 'strobe off',
      vehicle: 'Brizo',
      description: 'Enable (or disable) the strobe',
    },
    {
      id: '12',
      name: 'ibit',
      vehicle: 'Brizo',
      description: 'Run initiated built in test',
    },
  ],
  onSortColumn: (col, isAsc) => {
    console.log(
      `Clicked column number ${col}, which is sorted ${
        isAsc ? 'ascending' : 'descending'
      }`
    )
  },
  selectedId: '5',
}

const args: CommandModalProps = {
  steps: ['Command', 'Build', 'Schedule'],
  currentIndex: 0,
  vehicleName: 'Brizo',
  recentCommands: [
    {
      id: '1',
      name: 'restart logs',
    },
    {
      id: '2',
      name: 'stop',
    },
    {
      id: '3',
      name: 'schedule clear; schedule resume',
    },
  ],
  onCancel: () => console.log('cancel'),
  ...commandTableArgs,
}

export const Standard = Template.bind({})
Standard.args = args

Standard.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=6574%3A889',
  },
}
