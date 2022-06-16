import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CreateAccountForm, CreateAccountFormValues } from './CreateAccountForm'

const handleSubmit = async (values: CreateAccountFormValues) => {
  await new Promise((res) => setTimeout(res, 1000))
  return undefined
}

test('should render the initial value', async () => {
  render(
    <CreateAccountForm
      defaultValues={{ email: 'admin@example.com', password: '123456789' }}
      onSubmit={handleSubmit}
    />
  )
  expect(screen.getByDisplayValue('admin@example.com')).toBeInTheDocument()
  expect(screen.getByDisplayValue('123456789')).toBeInTheDocument()
})
