import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CommandTable, CommandTableProps } from './CommandTable'

const props: CommandTableProps = {
  commands: [
    {
      id: '1',
      name: 'test command',
      vehicle: 'Brizo',
      description: 'test description',
    },
    {
      id: '2',
      name: 'stop',
      vehicle: 'Tethys',
      description: 'Stop currently running mission',
    },
  ],
  onSelectCommand: () => {
    console.log('test')
  },
  selectedId: '1',
}

test('should render the component', async () => {
  expect(() => render(<CommandTable {...props} />)).not.toThrow()
})

test('should display header labels', async () => {
  render(<CommandTable {...props} />)
  expect(screen.queryByText(/COMMAND/)).toBeInTheDocument()
})

test('should display mission name label', async () => {
  render(<CommandTable {...props} />)
  expect(screen.queryByText(/test command/i)).toBeInTheDocument()
})

test('should display vehicle label', async () => {
  render(<CommandTable {...props} />)
  expect(screen.getByText(/Brizo/i)).toBeInTheDocument()
})

test('should display description label when description is provided', async () => {
  render(<CommandTable {...props} />)
  expect(screen.getByText(/test description/i)).toBeInTheDocument()
})
