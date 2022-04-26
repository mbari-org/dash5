import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { LoginModal, LoginModalProps } from './LoginModal'

const props: LoginModalProps = {
  open: true,
  onSubmit: async () => undefined,
  onForgotPass: () => undefined,
  onCreateAcct: () => undefined,
}

test('should render the component', async () => {
  expect(() => render(<LoginModal {...props} />)).not.toThrow()
})

test('should display login title', async () => {
  render(<LoginModal {...props} />)

  expect(screen.queryByText(/Log In/)).toBeInTheDocument()
})

test('should display forgot password', async () => {
  render(<LoginModal {...props} />)

  expect(screen.queryByText(/forgot password/i)).toBeInTheDocument()
})

test('should display create account', async () => {
  render(<LoginModal {...props} />)

  expect(screen.queryByText(/create account/i)).toBeInTheDocument()
})
