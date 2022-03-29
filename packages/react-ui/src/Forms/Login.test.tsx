import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Login, LoginValues } from './Login'
import { wait } from '@mbari/utils'

const handleSubmit = async (values: LoginValues) => {
  await wait(1)
  return undefined
}

test('should render the placeholder value', async () => {
  render(
    <Login
      defaultValues={{ email: 'admin@example.com', password: '123456789' }}
      onSubmit={handleSubmit}
    />
  )
  expect(screen.getByDisplayValue('admin@example.com')).toBeInTheDocument()
})
