import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Table, TableProps } from './Table'

const props: TableProps = {
  rows: [
    { values: ['MissionTimeout', '2 hours'] },
    { values: ['MaxDepth', '150 meters'], highlighted: true },
  ],
  header: {
    labels: ['SAFETY/COMMS', 'VALUES'],
  },
  highlightedStyle: 'text-teal-500',
}

const headerWithAccessory = {
  labels: ['SAFETY/COMMS', 'VALUES'],
  accessory: <span className="text-orange-500 opacity-60">DVL is off</span>,
}

test('should render the component', async () => {
  expect(() => render(<Table {...props} />)).not.toThrow()
})

test('should display header labels', async () => {
  render(<Table {...props} />)

  expect(screen.queryByText(`${props.header.labels[0]}`)).toBeInTheDocument()
})

test('should display accessory header when provided', async () => {
  render(<Table {...props} header={headerWithAccessory} />)

  expect(screen.queryByText(/dvl is off/i)).toBeInTheDocument()
})

test('should style highlighted cells with provided highlighted styling', async () => {
  render(<Table {...props} />)

  expect(screen.queryByText(`${props.rows[1].values[0]}`)).toHaveClass(
    'text-teal-500'
  )
})

test('should style unhighlighted cells as a lighter color', async () => {
  render(<Table {...props} />)

  expect(screen.queryByText(`${props.rows[0].values[0]}`)).toHaveClass(
    'opacity-60'
  )
})

test('should apply style with 2 grid columns if two values are provided for the content rows', async () => {
  render(<Table {...props} />)

  expect(screen.queryByTestId(/table header/i)).toHaveClass('grid-cols-2')
})

test('should apply style with 2 grid columns if two values are provided for the content rows', async () => {
  render(
    <Table
      {...props}
      rows={[{ values: ['Suspect', 'is', 'fleeing', 'the interview'] }]}
    />
  )

  expect(screen.queryByTestId(/table header/i)).toHaveClass('grid-cols-4')
})

test('should apply no top border style to a stackable table instance', async () => {
  render(<Table {...props} stackable />)

  expect(screen.queryByRole('table')).toHaveClass('border-t-0')
})
