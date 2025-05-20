import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CommsCell, CommsCellProps } from './CommsCell'

const props: CommsCellProps = {
  className: '',
  command: 'sched "jaguarSharks.xml"',
  entry: 'Mission 12345678',
  name: 'Steve Zissou',
  day: 'Today',
  time: '3:22',
  status: 'queued',
  commandType: 'mission',
  onSelect: () => {
    console.log('event fired')
  },
}

test('should render command to the screen', async () => {
  render(<CommsCell {...props} />)
  expect(screen.getByText(props.command)).toBeInTheDocument()
})

test('should have purple command text if scheduled', async () => {
  render(<CommsCell {...props} />)

  expect(screen.getByText(props.command)).toHaveClass('text-indigo-600')
})

test('should have green command text if any state other than scheduled', async () => {
  render(<CommsCell {...props} commandType="command" />)

  expect(screen.getByText(props.command)).toHaveClass('text-green-600')
})

test('should display queued icon when status is queued', async () => {
  render(<CommsCell {...props} />)

  expect(screen.getByLabelText(/queued icon/i)).toBeInTheDocument()
})

test('should display acknowledge icon when appropriate', async () => {
  render(<CommsCell {...props} status="ack" />)

  expect(screen.getByLabelText(/acknowledge icon/i)).toBeInTheDocument()
})
