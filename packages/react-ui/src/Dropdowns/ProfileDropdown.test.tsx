import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ProfileDropdown, ProfileDropdownProps } from './ProfileDropdown'

const props: ProfileDropdownProps = {
  profileName: 'test person',
  emailAddress: 'example',
  avatarUrl: 'example',
  options: [
    {
      label: 'test label',
      onSelect: () => {
        console.log('selected')
      },
    },
  ],
}

test('should render the component', async () => {
  expect(() => render(<ProfileDropdown {...props} />)).not.toThrow()
})

test('should display options', async () => {
  render(<ProfileDropdown {...props} />)

  expect(screen.queryByText(/test label/i)).toBeInTheDocument()
})

test('should display profile name', async () => {
  render(<ProfileDropdown {...props} />)

  expect(screen.queryByText(props.profileName)).toBeInTheDocument()
})

test('should display email address', async () => {
  render(<ProfileDropdown {...props} />)

  expect(screen.queryByText(props.emailAddress)).toBeInTheDocument()
})
