import React from 'react'
import { Story, Meta } from '@storybook/react'

import { MultiSelectField, MultiSelectFieldProps } from './MultiSelectField'
import { MultiValue } from 'react-select'
import { SelectOption } from './Select'

export default {
  title: 'Fields/MultiSelectField',
  component: MultiSelectField,
} as Meta

const selectOptions = [
  { name: 'Example A', id: 'A' },
  { name: 'Example B', id: 'B' },
]

const Template: Story<MultiSelectFieldProps> = (args) => {
  const [selected, setSelected] = React.useState<MultiValue<SelectOption>>([])
  return (
    <MultiSelectField
      {...args}
      onSelect={(s) => {
        setSelected(s ?? [])
      }}
      value={selected}
    />
  )
}

export const Standard = Template.bind({})
Standard.args = {
  label: 'Tag',
  name: 'tag',
  placeholder: 'Select a git tag...',
  options: selectOptions,
}
Standard.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=1601%3A508',
  },
}

export const WithoutLabel = Template.bind({})
WithoutLabel.args = {
  name: 'tag',
  placeholder: 'Select a git tag',
  options: selectOptions,
}
WithoutLabel.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=1601%3A508',
  },
}
