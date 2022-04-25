import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { DateTime } from 'luxon'

import { NewDeploymentForm, NewDeploymentFormValues } from './NewDeploymentForm'

const defaultValues: NewDeploymentFormValues = {
  deploymentName: 'Deployment Example',
  gitTag: 'v1.4.5',
  startTime: DateTime.local().toISO(),
}

describe('NewDeploymentForm', () => {
  test('should render the initial value', async () => {
    const onSubmit = jest.fn()

    render(
      <NewDeploymentForm defaultValues={defaultValues} onSubmit={onSubmit} />
    )

    const input = screen.getByDisplayValue('Deployment Example')
    const submitBtn = screen.getByText(/submit/i)

    fireEvent.change(input, { target: { value: 'New Deployment' } })

    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(onSubmit).toBeCalledTimes(1)

      expect(onSubmit).toBeCalledWith({
        ...defaultValues,
        deploymentName: 'New Deployment',
      })
    })
  })
})
