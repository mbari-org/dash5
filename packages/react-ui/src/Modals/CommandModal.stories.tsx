import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { CommandModal, CommandModalProps } from './CommandModal'
import { CommandTableProps } from '../Tables/CommandTable'
import { wait } from '@mbari/utils'
import { syntaxVariations, commands } from './CommandModal.sampleProps'

export default {
  title: 'Modals/CommandModal',
  component: CommandModal,
} as Meta

const Template: Story<CommandModalProps> = (args) => {
  const onSchedule: CommandModalProps['onSchedule'] = async (values) => {
    console.log('submitting')
    await wait(1)
    console.log('Submitted', values)
    return undefined
  }
  return <CommandModal {...args} onSchedule={onSchedule} />
}

const commandTableArgs: CommandTableProps = {
  commands,
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
  syntaxVariations,
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
  onSchedule: () => undefined,
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
Schedule.args = {
  ...args,
  currentStepIndex: 2,
  alternativeAddresses: ['one@example.com', 'two@example.com'],
}

Schedule.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=6863%3A944',
  },
}
