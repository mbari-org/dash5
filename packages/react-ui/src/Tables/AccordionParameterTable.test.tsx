import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import {
  AccordionParameterTable,
  AccordionParameterTableProps,
} from './AccordionParameterTable'

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

const props: AccordionParameterTableProps = {
  label: 'Test',
  onToggle: () => undefined,
  open: true,
  parameters: [
    {
      name: 'Repeat',
      description:
        'Number of times the vehicle should try to cycle through waypoints',
      value: '1',
      unit: 'count',
      overrideValue: '2',
    },
    {
      name: 'Speed',
      description: 'Speed while performing the YoYo behavior',
      value: '1',
      unit: 'meter_per_second',
      dvlOff: true,
    },
  ],
  onParamUpdate: (name) => console.log(name),
  unitOptions: [],
}

test('should render the component', async () => {
  expect(() => render(<AccordionParameterTable {...props} />)).not.toThrow()
})

test('should display parameter name', async () => {
  render(<AccordionParameterTable {...props} />)
  expect(
    screen.queryByText(props?.parameters?.[0]?.name ?? '')
  ).toBeInTheDocument()
})

test('should display parameter description', async () => {
  render(<AccordionParameterTable {...props} />)
  expect(
    screen.queryByText(`${props?.parameters?.[0]?.description}`)
  ).toBeInTheDocument()
})

test("should display the parameter's default value", async () => {
  render(<AccordionParameterTable {...props} />)
  expect(
    screen.queryByText(
      `${props?.parameters?.[0]?.value} ${props?.parameters?.[0]?.unit}`
    )
  ).toBeInTheDocument()
})

test("should display the parameter's override value if provided", async () => {
  render(<AccordionParameterTable {...props} />)
  expect(
    screen.queryByDisplayValue(`${props?.parameters?.[0]?.overrideValue}`)
  ).toBeInTheDocument()
})

test('should display dvl is off message if dvlOff flag is true', async () => {
  render(<AccordionParameterTable {...props} />)
  expect(screen.queryByText(/dvl is off/i)).toBeInTheDocument()
})

test('should display parameter name in teal if override value is provided', async () => {
  render(<AccordionParameterTable {...props} />)
  expect(screen.queryByText(props?.parameters?.[0]?.name ?? '')).toHaveClass(
    'text-teal-600'
  )
})

test('should display parameter name in orange if dvlOff flag is true', async () => {
  render(<AccordionParameterTable {...props} />)
  expect(screen.queryByText(props?.parameters?.[1]?.name ?? '')).toHaveClass(
    'text-orange-500/80'
  )
})
