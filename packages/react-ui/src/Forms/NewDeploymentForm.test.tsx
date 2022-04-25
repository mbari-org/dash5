import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { NewDeploymentForm, NewDeploymentFormValues } from './NewDeploymentForm'

const handleSubmit = async (values: NewDeploymentFormValues) => {
  await new Promise((res) => setTimeout(res, 1000))
  return undefined
}

test('should render the initial value', async () => {
  render(<NewDeploymentForm defaultValues={{}} onSubmit={handleSubmit} />)
  expect(screen.getByDisplayValue('admin@example.com')).toBeInTheDocument()
  expect(screen.getByDisplayValue('123456789')).toBeInTheDocument()
})
