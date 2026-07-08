import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import LineChart, { LineChartProps } from './LineChart'
import { DateTime } from 'luxon'

jest.mock('react-plotly.js', () => ({
  __esModule: true,
  default: ({ layout }: { layout: Record<string, unknown> }) => (
    <div
      data-testid="plot"
      data-uirevision={
        layout.uirevision !== undefined
          ? String(layout.uirevision)
          : '__unset__'
      }
    />
  ),
}))

const props: LineChartProps = {
  data: new Array(60).fill('').map((_, i) => ({
    value: Math.random() * 200,
    timestamp: DateTime.now()
      .minus({ hours: 60 - i })
      .toMillis(),
  })),
  name: 'Depth',
  title: 'Depth Chart',
  style: {
    width: '100%',
    height: 400,
  },
}

test('should render the component', async () => {
  expect(() => render(<LineChart {...props} />)).not.toThrow()
})

test('does not set uirevision on the Plotly layout when the prop is omitted', () => {
  render(<LineChart {...props} />)
  expect(screen.getByTestId('plot')).toHaveAttribute(
    'data-uirevision',
    '__unset__'
  )
})

test('passes uirevision to the Plotly layout when the prop is provided', () => {
  render(<LineChart {...props} uirevision="depth-latest-logset42" />)
  expect(screen.getByTestId('plot')).toHaveAttribute(
    'data-uirevision',
    'depth-latest-logset42'
  )
})
