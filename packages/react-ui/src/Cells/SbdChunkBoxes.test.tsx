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

test('marks in-transit boxes after delivered', () => {
  render(<SbdChunkBoxes delivered={1} inTransit={2} total={4} />)
  const boxes = screen.getByLabelText('SBD 1 of 4').querySelectorAll('li')
  expect(boxes).toHaveLength(4)
  expect(boxes[0].className).toMatch(/bg-teal-500/)
  expect(boxes[1].className).toMatch(/sbd-chunk-in-transit/)
  expect(boxes[2].className).toMatch(/sbd-chunk-in-transit/)
  expect(boxes[3].className).toMatch(/bg-stone-100/)
})

test('shows label text when requested', () => {
  render(<SbdChunkBoxes delivered={2} total={4} showLabel />)
  expect(screen.getByText('SBD 2 of 4')).toBeInTheDocument()
})
