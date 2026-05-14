import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Input } from './Input'

test('should render the placeholder value', async () => {
  render(<Input name="firstName" placeholder="Enter your name..." />)
  expect(screen.getByPlaceholderText('Enter your name...')).toBeInTheDocument()
})

test('should indicate an error', async () => {
  render(<Input name="firstName" placeholder="Enter your name..." error />)
  expect(screen.getByPlaceholderText('Enter your name...')).toHaveClass(
    'border-error text-error'
  )
})

test('should indicate a disabled state', async () => {
  render(<Input name="firstName" placeholder="Enter your name..." disabled />)
  expect(screen.getByPlaceholderText('Enter your name...')).toHaveClass(
    'cursor-not-allowed opacity-50'
  )
})

test('should default to autoCapitalize="none" to prevent mobile auto-caps on login fields', async () => {
  render(<Input name="email" placeholder="Email" />)
  expect(screen.getByPlaceholderText('Email')).toHaveAttribute(
    'autocapitalize',
    'none'
  )
})

test('should allow autoCapitalize to be overridden for name fields', async () => {
  render(
    <Input name="firstName" placeholder="First name" autoCapitalize="words" />
  )
  expect(screen.getByPlaceholderText('First name')).toHaveAttribute(
    'autocapitalize',
    'words'
  )
})
