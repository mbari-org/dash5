import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { VehicleDropdown } from './VehicleDropdown'
import { DropdownProps } from '../Navigation'
import { VehicleDropdownOption } from './VehicleDropdownOption'

const current = new Date().toISOString()
const props: DropdownProps = {
  options: [
    {
      label: (
        <VehicleDropdownOption
          name="pontus"
          status="deployed"
          missionName="Pontus 20 MBA photoshoot"
          lastEvent={current}
        />
      ),
      onSelect: () => {
        console.log('pontus')
      },
    },
    {
      label: (
        <VehicleDropdownOption
          name="daphne"
          status="ended"
          missionName="Daphne 109 MBTS"
          lastEvent={current}
        />
      ),
      onSelect: () => {
        console.log('daphne')
      },
    },
    {
      label: (
        <VehicleDropdownOption
          name="triton"
          status="ended"
          missionName="Triton 16 BoAc"
          lastEvent={current}
        />
      ),
      onSelect: () => {
        console.log('triton')
      },
    },
  ],
}

test('should render the component', async () => {
  expect(() => render(<VehicleDropdown {...props} />)).not.toThrow()
})

test('should display header', async () => {
  render(<VehicleDropdown {...props} />)

  expect(screen.queryByText(/select lrauv/i)).toBeInTheDocument()
})

test('should display provided option', async () => {
  render(<VehicleDropdown {...props} />)

  expect(screen.queryByText(/Pontus 20 MBA photoshoot/i)).toBeInTheDocument()
})

test('should display red status indicator icon if ended', async () => {
  render(<VehicleDropdown {...props} />)

  expect(screen.queryAllByLabelText(/status indicator icon/i)[1]).toHaveClass(
    'bg-red-600'
  )
})

test('should display red status indicator icon if status is not ended', async () => {
  render(<VehicleDropdown {...props} />)

  expect(screen.queryAllByLabelText(/status indicator icon/i)[0]).toHaveClass(
    'bg-teal-500'
  )
})
