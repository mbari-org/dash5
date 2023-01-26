import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { CommandModal, CommandModalProps } from './CommandModal'
import { CommandTableProps } from '../Tables/CommandTable'
import { ScheduleCommandFormValues } from '../Forms/ScheduleCommandForm'
import { wait } from '@mbari/utils'

export default {
  title: 'Modals/CommandModal',
  component: CommandModal,
} as Meta

const Template: Story<CommandModalProps> = (args) => {
  const onSubmit: (
    values: ScheduleCommandFormValues
  ) => Promise<undefined> = async (values: ScheduleCommandFormValues) => {
    console.log('submitting')
    await wait(1)
    console.log('Submitted', values)
    return undefined
  }
  const onAlt: (
    values: ScheduleCommandFormValues
  ) => Promise<undefined> = async (values: ScheduleCommandFormValues) => {
    console.log('alt submitting')
    await wait(1)
    console.log('Alt submitted', values)
    return undefined
  }
  return (
    <CommandModal {...args} onSubmit={onSubmit} onAltAddressSubmit={onAlt} />
  )
}

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

const args: Omit<CommandModalProps, 'onSubmit'> = {
  steps: ['Command', 'Build', 'Schedule'],
  currentStepIndex: 0,
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

export const Command = Template.bind({})
Command.args = args

Command.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=6574%3A889',
  },
}

export const Build = Template.bind({})
Build.args = { ...args, currentStepIndex: 1 }

Build.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=6574%3A1034',
  },
}

export const Schedule = Template.bind({})
Schedule.args = { ...args, currentStepIndex: 2 }

Schedule.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=6863%3A944',
  },
}
