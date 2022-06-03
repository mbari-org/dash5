import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ReassignmentForm, ReassignmentFormValues } from './ReassignmentForm'

const handleSubmit = async (values: ReassignmentFormValues) => {
  await new Promise((res) => setTimeout(res, 1000))
  return undefined
}

test('should render the initial value', () => {})
