import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Table, TableProps } from './Table'

const props: TableProps = {
  rows: [
    {
      values: [
        <div key="1">Lat1/Lon1</div>,
        <div key="2">
          <span className="font-bold">C1</span> 36.797, -121.847
        </div>,
      ],
      highlighted: true,
    },
    {
      values: [
        <div key="3">Lat2/Lon2</div>,
        <div key="4">
          <span className="font-bold">M1</span> 36.797, -121.847
        </div>,
      ],
      highlighted: false,
    },
    {
      values: [
        <div key="5">Lat3/Lon3</div>,
        <div key="6">
          <span className="font-bold">Custom</span> 36.797, -121.847
        </div>,
      ],
      highlighted: true,
    },
  ],
  header: {
    values: ['WAYPOINTS', 'VALUES'],
  },
  highlightedStyle: 'text-teal-500',
}

test.todo('should have tests')

test('should render the component', async () => {
  expect(() => render(<Table {...props} />)).not.toThrow()
})
