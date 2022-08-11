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

test('should have normal padding by default', async () => {
  render(<Button>Click Here</Button>)
  expect(screen.getByText(/Click Here/i)).toHaveClass('py-2')
  expect(screen.getByText(/Click Here/i)).toHaveClass('px-4')
})

test('should have tight padding when specified', async () => {
  render(<Button tight>Click Here</Button>)
  expect(screen.getByText(/Click Here/i)).toHaveClass('py-1')
  expect(screen.getByText(/Click Here/i)).toHaveClass('px-2')
})
