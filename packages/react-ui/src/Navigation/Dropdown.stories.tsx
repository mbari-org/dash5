import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { Dropdown, DropdownProps } from './Dropdown'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { faPlus } from '@fortawesome/pro-regular-svg-icons'

export default {
  title: 'Navigation/Dropdown',
  component: Dropdown,
} as Meta

const Template: Story<DropdownProps> = (args) => (
  <div className="bg-stone-200 p-4">
    <Dropdown {...args} />
  </div>
)

const args: DropdownProps = {
  className: '',
  currentValue: 'Brizo 7 EcoHab',
  description: 'Started 4+ days ago',
  options: [
    {
      label: 'New Brizo deployment',
      icon: faPlus as IconDefinition,
      onSelect: () => {},
      disabled: true,
    },
    {
      label: 'Brizo 6 Canon',
      onSelect: () => {},
    },
    { label: 'Brizo 5 Canon', onSelect: () => {} },
    { label: 'Brizo 4 Engineering', onSelect: () => {} },
    { label: 'Brizo 3 Canon', onSelect: () => {} },
    { label: 'Brizo 2 Canon', onSelect: () => {} },
    { label: 'Sea Trial 1', onSelect: () => {} },
  ],
}

export const Standard = Template.bind({})
Standard.args = args

Standard.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=752%3A795',
  },
}
