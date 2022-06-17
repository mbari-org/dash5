import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Button } from './Button'

test('should render the child as a label', async () => {
  render(<Button>Click Here</Button>)
  expect(screen.getByText(/Click Here/i)).toHaveTextContent('Click Here')
})

test('should be disabled when specified', async () => {
  render(<Button disabled>Click Here</Button>)
  expect(screen.getByText(/Click Here/i)).toHaveAttribute('disabled')
})
