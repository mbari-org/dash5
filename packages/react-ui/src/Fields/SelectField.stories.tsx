import React from 'react'
import { Story, Meta } from '@storybook/react'

import { SelectField, SelectFieldProps } from './SelectField'

export default {
  title: 'Fields/SelectField',
  component: SelectField,
} as Meta

const selectOptions = [
  { name: 'Example A', id: 'A' },
  { name: 'Example B', id: 'B' },
]

const Template: Story<SelectFieldProps> = (args) => <SelectField {...args} />

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
