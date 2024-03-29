import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import LineChart, { LineChartProps } from './LineChart'
import { DateTime } from 'luxon'

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
