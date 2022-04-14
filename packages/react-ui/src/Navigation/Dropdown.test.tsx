import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Dropdown, DropdownProps } from './Dropdown'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { faPlus } from '@fortawesome/pro-regular-svg-icons'

const props: DropdownProps = {
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

test('should render current value when provided', async () => {
  render(<Dropdown {...props} />)

  expect(screen.getByLabelText(/current value/i)).toBeInTheDocument()
})

test('should render disabled options with lighter text', async () => {
  render(
    <Dropdown
      {...props}
      options={[
        {
          label: 'Disabled test option',
          onSelect: () => {},
          disabled: true,
        },
      ]}
    />
  )

  expect(screen.getByText(/Disabled test option/i)).toHaveClass('opacity-30')
})
