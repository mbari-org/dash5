import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { DateTime } from 'luxon'

import { NewDeploymentForm, NewDeploymentFormValues } from './NewDeploymentForm'

const defaultValues: NewDeploymentFormValues = {
  deploymentName: 'Deployment Example',
  gitTag: 'v1.4.5',
  startTime: DateTime.local().toISO(),
  timeZone: '',
}

describe('NewDeploymentForm', () => {
  test('should render the initial value', async () => {
    const onSubmit = jest.fn()

    render(
      <NewDeploymentForm defaultValues={defaultValues} onSubmit={onSubmit} />
    )

    const input = screen.getByDisplayValue('Deployment Example')
    const submitBtn = screen.getByText(/Submit Form/i)

    fireEvent.change(input, { target: { value: 'New Deployment' } })

    fireEvent.submit(submitBtn)

    await waitFor(() => {
      expect(onSubmit).toBeCalled()

      expect(onSubmit).toBeCalledWith({
        ...defaultValues,
        deploymentName: 'New Deployment',
      })
    })
  })
})
