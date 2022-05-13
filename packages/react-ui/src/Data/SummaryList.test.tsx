import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { SummaryList, SummaryListProps } from './SummaryList'

const props: SummaryListProps = {
  header: 'ESTIMATES',
  values: [
    'Total mission time: 12 minutes of 6h 10m',
    'Time in transit: 1.5 of 4 hours complete',
    'Travel distance: 3.6 of 7.2km complete',
    'Bottom depth: 100 to 180 meters',
  ],
}

test('should render the component', async () => {
  expect(() => render(<SummaryList {...props} />)).not.toThrow()
})

test('should display the header', async () => {
  render(<SummaryList {...props} />)

  expect(screen.queryByText(`${props.header}`))
})

test('should display supplied values', async () => {
  render(<SummaryList {...props} />)

  expect(screen.queryByText(`${props.values[0]}`))
})
