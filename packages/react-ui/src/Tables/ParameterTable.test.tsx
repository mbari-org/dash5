import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ParameterTable, ParameterTableProps } from './ParameterTable'

jest.mock('../assets/ruler-dark.png', () => {
  return {
    default: 'fake.png',
  }
})

jest.mock('../assets/ruler-light.png', () => {
  return {
    default: 'fake.png',
  }
})

const props: ParameterTableProps = {
  parameters: [
    {
      name: 'Repeat',
      description:
        'Number of times the vehicle should try to cycle through waypoints',
      defaultValue: '1 count',
      overrideValue: '2 counts',
    },
    {
      name: 'Speed',
      description: 'Speed while performing the YoYo behavior',
      defaultValue: '1 meter_per_second',
      dvlOff: true,
    },
  ],
  onVerifyValue: (value) => value,
}

test('should render the component', async () => {
  expect(() => render(<ParameterTable {...props} />)).not.toThrow()
})

test('should display parameter name', async () => {
  render(<ParameterTable {...props} />)
  expect(screen.queryByText(props.parameters[0].name)).toBeInTheDocument()
})

test('should display parameter description', async () => {
  render(<ParameterTable {...props} />)
  expect(
    screen.queryByText(props.parameters[0].description)
  ).toBeInTheDocument()
})

test("should display the parameter's default value", async () => {
  render(<ParameterTable {...props} />)
  expect(
    screen.queryByText(props.parameters[0].defaultValue)
  ).toBeInTheDocument()
})

test("should display the parameter's override value if provided", async () => {
  render(<ParameterTable {...props} />)
  expect(
    screen.queryByDisplayValue(`${props.parameters[0].overrideValue}`)
  ).toBeInTheDocument()
})

test('should display dvl is off message if dvlOff flag is true', async () => {
  render(<ParameterTable {...props} />)
  expect(screen.queryByText(/dvl is off/i)).toBeInTheDocument()
})

test('should display parameter name in teal if override value is provided', async () => {
  render(<ParameterTable {...props} />)
  expect(screen.queryByText(props.parameters[0].name)).toHaveClass(
    'text-teal-600'
  )
})

test('should display parameter name in orange if dvlOff flag is true', async () => {
  render(<ParameterTable {...props} />)
  expect(screen.queryByText(props.parameters[1].name)).toHaveClass(
    'text-orange-500/80'
  )
})
