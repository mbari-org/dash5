import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { DateField } from './DateField'

test('should render the placeholder value', async () => {
  render(<DateField name="launchDate" placeholder="Select a date" />)
  expect(screen.getByPlaceholderText('Select a date')).toBeInTheDocument()
})

test('should indicate a disabled state', async () => {
  render(<DateField name="launchDate" placeholder="Select a date" disabled />)
  expect(screen.getByPlaceholderText('Select a date')).toHaveClass(
    'cursor-not-allowed opacity-50'
  )
})

test('should not render the date picker by default', async () => {
  render(<DateField name="launchDate" placeholder="Select a date" />)
  expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
})
