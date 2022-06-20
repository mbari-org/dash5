import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import {
  ForgotPasswordModal,
  ForgotPasswordModalProps,
} from './ForgotPasswordModal'

const props: ForgotPasswordModalProps = {
  onSubmit: jest.fn(),
  open: true,
}

test('should render the component', async () => {
  expect(() => render(<ForgotPasswordModal {...props} />)).not.toThrow()
})
