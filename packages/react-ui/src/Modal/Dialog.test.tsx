import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Dialog } from './Dialog'

test('should render the title', async () => {
  render(<Dialog title="Test" message="Here is a message" open />)
  expect(screen.getByText(/Test/i)).toHaveTextContent('Test')
})

test('should render the message', async () => {
  render(<Dialog title="Test" message="Here is a message" open />)
  expect(screen.getByText(/Here is a message/i)).toHaveTextContent(
    'Here is a message'
  )
})

test('should render the confirm button', async () => {
  render(
    <Dialog
      title="Test"
      message="Here is a message"
      onConfirm={() => {}}
      open
    />
  )
  expect(screen.getByText(/Confirm/i)).toHaveTextContent('Confirm')
})

test('should not render the confirm button', async () => {
  render(<Dialog title="Test" message="Here is a message" open />)
  expect(screen.queryByText(/Confirm/i)).not.toBeInTheDocument()
})

test('should render the cancel button', async () => {
  render(
    <Dialog title="Test" message="Here is a message" open onCancel={() => {}} />
  )
  expect(screen.getByText(/Cancel/i)).toHaveTextContent('Cancel')
})

test('should not render the cancel button', async () => {
  render(<Dialog title="Test" message="Here is a message" open />)
  expect(screen.queryByText(/Cancel/i)).not.toBeInTheDocument()
})
