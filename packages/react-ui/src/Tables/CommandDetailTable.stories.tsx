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
  parameters: [
    {
      name: 'Module',
      description: 'Description of a module',
      value: 'Science',
      inputType: 'string',
      argType: 'ARG_STRING',
      options: [{ name: 'Module', options: ['Science', 'Navigation'] }],
    },
    {
      name: 'Component',
      description: 'Description of a component',
      value: 'CTD_Seabird',
      inputType: 'string',
      argType: 'ARG_STRING',
      options: [{ name: 'Component', options: ['CTD_Seabird', 'CTD_Wetlabs'] }],
    },
    {
      name: 'Element',
      description: 'Description of a element',
      value: 'loadAtStartup',
      inputType: 'string',
      argType: 'ARG_STRING',
      options: [
        { name: 'Element', options: ['loadAtStartup', 'loadAtStartup'] },
      ],
    },
    {
      name: 'Float number',
      description: 'Description of a float number',
      value: '1',
      inputType: 'number',
      argType: 'ARG_STRING',
    },
    {
      name: 'Unit',
      description: 'Description of a unit',
      value: 'bool',
      inputType: 'boolean',
      argType: 'ARG_STRING',
    },
    {
      name: 'Persist',
      inputType: 'boolean',
      argType: 'ARG_STRING',
      description: 'Description of a unit',
    },
  ],
  onSelect: (param, value) => console.log(`param: ${param}  value: ${value}`),
}

export const Standard = Template.bind({})
Standard.args = args
Standard.parameters = {
  design: {
    inputType: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=5569%3A805',
  },
}
