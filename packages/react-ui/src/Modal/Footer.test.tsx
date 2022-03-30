import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Footer } from './Footer'

test('should not render cancel button if a handler has not been specified', async () => {
  render(<Footer />)
  expect(screen.queryByText(/Cancel/i)).not.toBeInTheDocument()
})

test('should render cancel button if a handler has been specified', async () => {
  render(<Footer onCancel={() => {}} />)
  expect(screen.queryByText(/Cancel/i)).toBeInTheDocument()
})

test('should not render confirm button if a handler has not been specified', async () => {
  render(<Footer />)
  expect(screen.queryByText(/confirm/i)).not.toBeInTheDocument()
})

test('should render confirm button if a handler has been specified', async () => {
  render(<Footer onConfirm={() => {}} />)
  expect(screen.queryByText(/confirm/i)).toBeInTheDocument()
})
