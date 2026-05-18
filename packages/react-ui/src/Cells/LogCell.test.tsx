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
  // Compact mode uses a flex-row layout; the inner wrapper is the direct child of article
  const inner = container.querySelector('article > div') as HTMLElement
  expect(inner).toHaveClass('px-2')
  expect(inner).toHaveClass('py-0.5')
  expect(inner).toHaveClass('text-xs')
  expect(inner).not.toHaveClass('p-4')
})

test('applies default padding and text size when compact is false', async () => {
  const { container } = render(<LogCell {...props} compact={false} />)
  const grid = container.querySelector('.grid') as HTMLElement
  expect(grid).toHaveClass('p-4')
  expect(grid).toHaveClass('text-sm')
  expect(grid).not.toHaveClass('px-2')
})

test('applies labelColor to the label element in comfortable mode', async () => {
  render(<LogCell {...props} labelColor="#c78204" />)
  const label = screen.getByText(props.label)
  expect(label).toHaveStyle({ color: '#c78204' })
})

test('applies labelColor to the label element in compact mode', async () => {
  render(<LogCell {...props} labelColor="#0000ff" compact />)
  const label = screen.getByText(props.label)
  expect(label).toHaveStyle({ color: '#0000ff' })
})

test('does not set inline color on label when labelColor is omitted', async () => {
  render(<LogCell {...props} />)
  const label = screen.getByText(props.label)
  expect(label).not.toHaveAttribute('style')
})
