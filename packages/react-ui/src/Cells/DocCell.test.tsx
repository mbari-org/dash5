import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { DocCell, DocCellProps } from './DocCell'

const props: DocCellProps = {
  onSelect: () => {
    console.log('event fired')
  },
  onMoreClick: () => {
    console.log('event fired')
  },
  onSelectAttachment: (attachment) => {
    console.log(attachment)
  },
  docId: 3000798,
  docInstanceId: 2003798,
  time: '16:29:32',
  date: 'Dec. 15, 2021',
  label: 'Maintenance Log - Brizo',
  attachments: [{ name: 'Gup S EcoHAB', id: '1', type: 'deployment' }],
}

test('should render the label', async () => {
  render(<DocCell {...props} />)

  expect(screen.getByText(props.label)).toBeInTheDocument()
})

test('should render the date and time', async () => {
  render(<DocCell {...props} />)

  expect(screen.getByLabelText(/time/i)).toHaveTextContent(props.time)
  expect(screen.getByLabelText(/date/i)).toHaveTextContent(props.date)
})

test('should render the mission tag', async () => {
  render(<DocCell {...props} />)

  expect(
    screen.getByText(`${props?.attachments?.[0].name}`)
  ).toBeInTheDocument()
})

test('should render the more options button', async () => {
  render(<DocCell {...props} />)

  expect(screen.getByLabelText(/more options/i)).toBeInTheDocument()
})

test('should render the secondary label when provided', async () => {
  render(<DocCell {...props} secondary="predeployment" />)

  expect(screen.getByText('predeployment')).toBeInTheDocument()
})

test('should not render a secondary label when secondary is undefined', async () => {
  const { container } = render(<DocCell {...props} />)

  // Assert the secondary element itself is absent, not a hard-coded string
  expect(container.querySelector('span.text-gray-400')).not.toBeInTheDocument()
})

test('should not render a secondary label when secondary is empty string', async () => {
  // Compare against a baseline render with no secondary prop — HTML should
  // be identical, confirming the empty string produces no extra element.
  const { container: baseline } = render(<DocCell {...props} />)
  const { container: withEmpty } = render(<DocCell {...props} secondary="" />)

  expect(withEmpty.innerHTML).toBe(baseline.innerHTML)
})

test('label button should have a title attribute matching the full label', async () => {
  render(<DocCell {...props} />)

  const button = screen.getByRole('button', { name: props.label })
  expect(button).toHaveAttribute('title', props.label)
})
