import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ReassignmentForm } from './ReassignmentForm'

describe('ReassignmentForm', () => {
  test('should render the vehicles', async () => {
    const onSubmit = jest.fn()

    render(
      <ReassignmentForm
        onSubmit={onSubmit}
        vehicles={[
          {
            vehicleId: '1',
            vehicleName: 'Vehicle 1',
            pic: 'Pic 1',
            onCall: 'On Call 1',
          },
          {
            vehicleId: '2',
            vehicleName: 'Vehicle 2',
            pic: 'Pic 2',
            onCall: 'On Call 2',
          },
        ]}
      />
    )

    expect(screen.getByText('Vehicle 1')).toBeInTheDocument()
    expect(screen.getByText('Vehicle 2')).toBeInTheDocument()
    expect(() => {
      screen.getByText('Vehicle 3')
    }).toThrow()
  })
})
