import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { LoginForm, LoginFormValues } from './LoginForm'
import { wait } from '@mbari/utils'

const handleSubmit = async (values: LoginFormValues) => {
  await wait(1)
  return undefined
}

test('should render the placeholder value', async () => {
  render(
    <LoginForm
      defaultValues={{ email: 'admin@example.com', password: '123456789' }}
      onSubmit={handleSubmit}
    />
  )
  expect(screen.getByDisplayValue('admin@example.com')).toBeInTheDocument()
})
