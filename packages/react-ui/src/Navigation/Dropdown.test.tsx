import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Dropdown, DropdownProps } from './Dropdown'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { faPlus } from '@fortawesome/pro-regular-svg-icons'

const props: DropdownProps = {
  header: (
    <ul>
      <li>Test header</li>
      <li className="font-medium">Test subheader</li>
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

test('should display header when provided', async () => {
  render(<Dropdown {...props} />)

  expect(screen.getByText(/test header/i)).toBeInTheDocument()
})

test('should render disabled options with lighter text', async () => {
  render(
    <Dropdown
      {...props}
      options={[
        {
          label: 'Disabled test option',
          onSelect: () => {
            console.log('event fired')
          },
          disabled: true,
        },
      ]}
    />
  )

  expect(screen.getByText(/Disabled test option/i)).toHaveClass('opacity-30')
})
