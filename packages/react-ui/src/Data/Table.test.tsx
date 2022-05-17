import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Table, TableProps } from './Table'

const props: TableProps = {
  rows: [
    { cells: [{ label: 'MissionTimeout' }, { label: '2 hours' }] },
    {
      cells: [{ label: 'MaxDepth' }, { label: '150 meters' }],
      highlighted: true,
    },
  ],
  header: {
    cells: [
      {
        label: 'SAFETY/COMMS',
      },
      { label: 'VALUES' },
    ],
  },
  highlightedStyle: 'text-teal-500',
}

const headerWithAccessory = {
  cells: [
    {
      label: 'SAFETY/COMMS',
    },
    { label: 'VALUES' },
  ],
  accessory: <span className="text-orange-500 opacity-60">DVL is off</span>,
}

test('should render the component', async () => {
  expect(() => render(<Table {...props} />)).not.toThrow()
})

test('should display header labels', async () => {
  render(<Table {...props} />)

  expect(
    screen.queryByText(`${props.header.cells[0].label}`)
  ).toBeInTheDocument()
})

test('should display accessory header when provided', async () => {
  render(<Table {...props} header={headerWithAccessory} />)

  expect(screen.queryByText(/dvl is off/i)).toBeInTheDocument()
})

test('should style highlighted cells with provided highlighted styling', async () => {
  render(
    <Table
      {...props}
      rows={[
        {
          cells: [{ label: 'MaxDepth' }, { label: '150 meters' }],
          highlighted: true,
        },
      ]}
    />
  )

  const highlightedCell = screen.queryAllByTestId('table cell')[0]
  expect(highlightedCell).toHaveClass('text-teal-500')
})

test('should style unhighlighted cells as a lighter color', async () => {
  render(<Table {...props} />)

  const tableCell = screen.queryAllByTestId('table cell')[0]

  expect(tableCell).toHaveClass('opacity-60')
})

test('should apply style with 2 grid columns if two values are provided for the content rows', async () => {
  render(<Table {...props} />)

  expect(screen.queryByTestId(/table header/i)).toHaveClass('grid-cols-2')
})

test('should apply style with 2 grid columns if two values are provided for the content rows', async () => {
  render(
    <Table
      {...props}
      rows={[
        {
          cells: [
            { label: 'Suspect' },
            { label: 'is' },
            { label: 'fleeing' },
            { label: 'the interview' },
          ],
        },
      ]}
    />
  )

  expect(screen.queryByTestId(/table header/i)).toHaveClass('grid-cols-4')
})

test('should apply no top border style to a stackable table instance', async () => {
  render(<Table {...props} stackable />)

  expect(screen.queryByTestId('table container')).toHaveClass('border-t-0')
})

test('should display secondary label in table cell', async () => {
  render(
    <Table
      {...props}
      rows={[
        {
          cells: [
            { label: 'MissionTimeout', secondary: 'Test secondary cell label' },
            { label: '2 hours' },
          ],
        },
      ]}
    />
  )

  expect(screen.queryByText(/test secondary cell label/i)).toBeInTheDocument()
})

test('should display secondary label in table header', async () => {
  render(
    <Table
      {...props}
      header={{
        cells: [
          {
            label: 'SAFETY/COMMS',
            secondary: 'Test secondary header label',
          },
          { label: 'VALUES' },
        ],
      }}
    />
  )

  expect(screen.queryByText(/test secondary header label/i)).toBeInTheDocument()
})

test('should display sort icon in header cell when sort function is provided', async () => {
  render(
    <Table
      {...props}
      header={{
        cells: [
          {
            label: 'SAFETY/COMMS',
            onSort: (col) => {
              console.log(col)
            },
          },
          { label: 'VALUES' },
        ],
      }}
    />
  )

  expect(screen.queryByLabelText('sort icon')).toBeInTheDocument()
})
