import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { Dropdown, DropdownProps } from './Dropdown'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { faPlus } from '@fortawesome/pro-regular-svg-icons'
import { Button } from './Button'

export default {
  title: 'Navigation/Dropdown',
  component: Dropdown,
} as Meta

const Template: Story<DropdownProps> = (args) => {
  const [visible, setVisible] = React.useState(true)

  return (
    <div className="bg-stone-200 p-4">
      <Button onClick={() => setVisible(!visible)}>Toggle DropDown</Button>
      {visible && (
        <div className="relative mt-4 w-60">
          <Dropdown {...args} />
        </div>
      )}
    </div>
  )
}

const args: DropdownProps = {
  className: '',
  header: (
    <ul>
      <li>Started 4+ days ago</li>
      <li className="font-medium">Brizo 7 EcoHab</li>
    </ul>
  ),
  options: [
    {
      label: 'New Brizo deployment',
      icon: faPlus as IconDefinition,
      onSelect: () => {
        console.log('event fired')
      },
      disabled: true,
    },
    {
      label: 'Brizo 6 Canon',
      onSelect: () => {
        console.log('event fired')
      },
    },
    {
      label: 'Brizo 5 Canon',
      onSelect: () => {
        console.log('event fired')
      },
    },
    {
      label: 'Brizo 4 Engineering',
      onSelect: () => {
        console.log('event fired')
      },
    },
    {
      label: 'Brizo 3 Canon',
      onSelect: () => {
        console.log('event fired')
      },
    },
    {
      label: 'Brizo 2 Canon',
      onSelect: () => {
        console.log('event fired')
      },
    },
    {
      label: 'Sea Trial 1',
      onSelect: () => {
        console.log('event fired')
      },
    },
  ],
}

export const Standard = Template.bind({})
Standard.args = args

export const WithDismiss = Template.bind({})
WithDismiss.args = { ...args, onDismiss: () => console.log('dismissed') }

Standard.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=752%3A795',
  },
}
