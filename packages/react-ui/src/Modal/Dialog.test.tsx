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
      onConfirm={() => {
        console.log('event fired')
      }}
      open
    />
  )
  expect(screen.getByText(/Confirm/i)).toHaveTextContent('Confirm')
})

test('should render the confirm button if an external form has been specified', async () => {
  render(
    <Dialog title="Test" message="Here is a message" form="testForm" open />
  )
  expect(screen.getByText(/Confirm/i)).toHaveAttribute('form', 'testForm')
})

test('should not render the confirm button', async () => {
  render(<Dialog title="Test" message="Here is a message" open />)
  expect(screen.queryByText(/Confirm/i)).not.toBeInTheDocument()
})

test('should render the cancel button', async () => {
  render(
    <Dialog
      title="Test"
      message="Here is a message"
      open
      onCancel={() => {
        console.log('event fired')
      }}
    />
  )
  expect(screen.getByText(/Cancel/i)).toHaveTextContent('Cancel')
})

test('should not render the cancel button', async () => {
  render(<Dialog title="Test" message="Here is a message" open />)
  expect(screen.queryByText(/Cancel/i)).not.toBeInTheDocument()
})
