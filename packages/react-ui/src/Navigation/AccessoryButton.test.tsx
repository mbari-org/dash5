import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AccessoryButton } from './AccessoryButton'
import { faPlus } from '@fortawesome/pro-solid-svg-icons'
import { IconProp } from '@fortawesome/fontawesome-svg-core'

test('should render child content', async () => {
  render(<AccessoryButton label="Click Here" />)
  expect(screen.getByText(/Click Here/i)).toHaveTextContent('Click Here')
})

test('should render an icon if specified', async () => {
  render(<AccessoryButton label="Click Here" icon={faPlus as IconProp} />)
  expect(screen.getByLabelText(/icon/i)).toBeInTheDocument()
})

test('should not render an icon if none was specified', async () => {
  render(<AccessoryButton label="Click Here" />)
  expect(screen.queryByLabelText(/icon/i)).not.toBeInTheDocument()
})

test('should display label in teal if active', async () => {
  render(<AccessoryButton label="Click Here" isActive={true} />)

  expect(screen.getByText(/Click Here/i)).toHaveClass('text-teal-500')
})
