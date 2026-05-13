import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { LogCell, LogCellProps } from './LogCell'

const props: LogCellProps = {
  label: 'important',
  time: '11:11:11',
  date: '2022-04-04',
  log: 'what would be the scientific purpose of killing it?',
  isUpload: true,
}

test('should render the label', async () => {
  render(<LogCell {...props} />)

  expect(screen.getByText(props.label)).toBeInTheDocument()
})

test('should have lighter text on time and date', async () => {
  render(<LogCell {...props} />)

  expect(screen.getByText(props.time)).toHaveClass('opacity-60')
  expect(screen.getByText(props.date)).toHaveClass('opacity-60')
})

test('should contain the upload data icon when uploading data', async () => {
  render(<LogCell {...props} />)

  expect(screen.getByLabelText(/upload data/i)).toBeInTheDocument()
})

test('should contain the download data icon when downloading data', async () => {
  render(<LogCell {...props} isUpload={false} />)

  expect(screen.getByLabelText(/download data/i)).toBeInTheDocument()
})

test('renders timeAgo when provided', async () => {
  render(<LogCell {...props} timeAgo="3m ago" />)
  expect(screen.getByLabelText(/time ago/i)).toHaveTextContent('3m ago')
})

test('does not render timeAgo element when omitted', async () => {
  render(<LogCell {...props} />)
  expect(screen.queryByLabelText(/time ago/i)).not.toBeInTheDocument()
})

test('applies compact padding and text size when compact is true', async () => {
  const { container } = render(<LogCell {...props} compact />)
  const grid = container.querySelector('.grid')
  expect(grid).toHaveClass('px-2')
  expect(grid).toHaveClass('py-0.5')
  expect(grid).toHaveClass('text-xs')
  expect(grid).not.toHaveClass('p-4')
})

test('applies default padding and text size when compact is false', async () => {
  const { container } = render(<LogCell {...props} compact={false} />)
  const grid = container.querySelector('.grid')
  expect(grid).toHaveClass('p-4')
  expect(grid).toHaveClass('text-sm')
  expect(grid).not.toHaveClass('px-2')
})
