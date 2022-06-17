import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import {
  ForgotPasswordForm,
  ForgotPasswordFormValues,
} from './ForgotPasswordForm'

const handleSubmit = async (values: ForgotPasswordFormValues) => {
  await new Promise((res) => setTimeout(res, 1000))
  return undefined
}

test('should render the initial value', async () => {
  render(
    <ForgotPasswordForm
      defaultValues={{ email: 'admin@example.com' }}
      onSubmit={handleSubmit}
    />
  )
  expect(screen.getByDisplayValue('admin@example.com')).toBeInTheDocument()
})
