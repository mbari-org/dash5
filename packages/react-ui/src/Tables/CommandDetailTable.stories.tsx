import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { CommandDetailTable, CommandDetailProps } from './CommandDetailTable'

export default {
  title: 'Tables/CommandDetail',
  component: CommandDetailTable,
} as Meta

const Template: Story<CommandDetailProps> = (args) => (
  <CommandDetailTable {...args} />
)

const args: CommandDetailProps = {
  commands: [
    {
      name: 'Module',
      description: 'Description of a module',
      value: 'Science',
      options: ['Science', 'Alchemy'],
    },
    {
      name: 'Component',
      description: 'Description of a component',
      value: 'CTD_Seabird',
      options: ['CTD_Seabird', 'GTO_Mustang'],
    },
    {
      name: 'Element',
      description: 'Description of a element',
      value: 'loadAtStartup',
      options: ['loadAtStartup', 'componentDidMount'],
    },
    {
      name: 'Float number',
      description: 'Description of a float number',
      value: '1',
      options: ['1', '2022'],
    },
    {
      name: 'Unit',
      description: 'Description of a unit',
      value: 'bool',
      options: ['bool', 'nand'],
    },
    {
      name: 'Persist',
      description: 'Description of a unit',
    },
  ],
  onSelect: (param, value) => console.log(`param: ${param}  value: ${value}`),
}

export const Standard = Template.bind({})
Standard.args = args
Standard.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=5569%3A805',
  },
}
