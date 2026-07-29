import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { SbdChunkBoxes } from './SbdChunkBoxes'

test('renders nothing for single-part totals', () => {
  const { container } = render(<SbdChunkBoxes delivered={1} total={1} />)
  expect(container).toBeEmptyDOMElement()
})

test('shows delivered of total for multi-part', () => {
  render(<SbdChunkBoxes delivered={2} total={3} />)
  expect(screen.getByLabelText('SBD 2 of 3')).toBeInTheDocument()
  expect(
    screen.getByLabelText('SBD 2 of 3').querySelectorAll('li')
  ).toHaveLength(3)
})
