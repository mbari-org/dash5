import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CreateAccountModal } from './CreateAccountModal'

const props = {
  onSubmit: jest.fn(),
  open: true,
}

test('should render the component', async () => {
  expect(() => render(<CreateAccountModal {...props} />)).not.toThrow()
})
