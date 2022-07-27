import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CommandModal, CommandModalProps } from './CommandModal'

const props: CommandModalProps = {
  steps: ['Command', 'Build', 'Schedule'],
  currentIndex: 0,
  vehicleName: 'Brizo',
  recentCommands: [
    {
      id: '1',
      name: 'restart logs',
    },
    {
      id: '2',
      name: 'stop',
    },
    {
      id: '3',
      name: 'schedule clear; schedule resume',
    },
  ],
  onCancel: () => console.log('cancel'),
  commands: [
    {
      id: '1',
      name: 'restart logs',
      vehicle: 'Brizo',
      description: 'Restart, from least impact (logs) to most impact (system)',
    },
    {
      id: '2',
      name: 'stop',
      vehicle: 'Tethys',
      description: 'Stop currently running mission',
    },
    {
      id: '3',
      name: 'schedule clear; schedule resume',
      vehicle: 'Tethys',
      description: 'Schedule commands for later execution',
    },
    {
      id: '4',
      name: 'restart app',
      vehicle: 'Tethys',
      description: 'Restart, from least impact (logs) to most impact (system)',
    },
    {
      id: '5',
      name: 'configSet CTD_Seabird.loadAtStartup 1 bool persist;',
      vehicle: 'Brizo',
      description: 'Set configuration variable value',
    },
  ],
  onSortColumn: (col, isAsc) => {
    console.log(
      `Clicked column number ${col}, which is sorted ${
        isAsc ? 'ascending' : 'descending'
      }`
    )
  },
  selectedId: '5',
}

test('should render the component', async () => {
  expect(() => render(<CommandModal {...props} />)).not.toThrow()
})

test('should display command names', async () => {
  render(<CommandModal {...props} />)
  expect(screen.queryByText(props.commands[0].name)).toBeInTheDocument()
})

test('should display command descriptions', async () => {
  render(<CommandModal {...props} />)
  expect(
    screen.queryByText(`${props.commands[1].description}`)
  ).toBeInTheDocument()
})

test('should display vehicle name in teal', async () => {
  render(<CommandModal {...props} />)
  expect(screen.queryByTestId(/vehicle name/i)).toHaveClass('text-teal-500')
})

test('should display progress bar steps', async () => {
  render(<CommandModal {...props} />)
  const stepLabels = props.steps.map((step, index) => `${index + 1}. ${step}`)
  expect(screen.queryAllByText(stepLabels[0])[0]).toBeInTheDocument()
  expect(screen.queryAllByText(stepLabels[1])[0]).toBeInTheDocument()
  expect(screen.queryAllByText(stepLabels[2])[0]).toBeInTheDocument()
})

test('should display recent commands placeholder text', async () => {
  render(<CommandModal {...props} />)
  expect(screen.queryByText(/recent commands/i)).toBeInTheDocument()
})

test('should display search commands placeholder text', async () => {
  render(<CommandModal {...props} />)
  expect(screen.queryByPlaceholderText(/search commands/i)).toBeInTheDocument()
})
