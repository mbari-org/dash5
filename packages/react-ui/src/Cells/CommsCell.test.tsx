import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CommsCell, CommsCellProps } from './CommsCell'

const props: CommsCellProps = {
  className: '',
  command: 'sched “jaguarSharks.xml”',
  entry: 'Mission 12345678',
  name: 'Steve Zissou',
  description: 'Waiting to transmit',
  day: 'Today',
  time: '3:22',
  isUpload: true,
  isScheduled: true,
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
  render(<CommsCell {...props} isScheduled={false} />)

  expect(screen.getByText(props.command)).toHaveClass('text-green-600')
})

test('should display transmitting icon when uploading', async () => {
  render(<CommsCell {...props} />)

  expect(screen.getByLabelText(/transmitting icon/i)).toBeInTheDocument()
})

test('should display acknowledge icon when appropriate', async () => {
  render(<CommsCell {...props} isUpload={false} />)

  expect(screen.getByLabelText(/acknowledge icon/i)).toBeInTheDocument()
})
