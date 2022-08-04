import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import {
  Sample,
  SampleCollectionView,
  SampleCollectionViewProps,
} from './SampleCollectionView'

const samples: Sample[] = [
  {},
  {
    status: 'partial',
    modifier: 'redo',
    percentCompleted: 73,
    quantity: 2309.13,
    timeCollected: '2022-05-25',
  },
  {
    status: 'partial',
    modifier: 'last',
    percentCompleted: 76,
    quantity: 230.18,
    timeCollected: '2022-05-23',
  },
  {
    status: 'fail',
    modifier: 'redo',
    percentCompleted: 0,
    quantity: 230.08,
    timeCollected: '2022-05-28',
  },
  {
    status: 'good',
    quantity: 229.48,
    timeCollected: '2022-05-16',
  },
]

const props: SampleCollectionViewProps = {
  samples,
  archived: {
    status: 'good',
    quantity: 231.33,
    timeCollected: '2021-08-19T11:48:00.000Z',
  },
  vehicleName: 'makai',
}

test('should render the component', () => {
  expect(() => render(<SampleCollectionView {...props} />)).not.toThrow()
})

test('should render child content', async () => {
  render(<SampleCollectionView {...props} />)

  expect(screen.getByText(/01/i)).toBeInTheDocument()
  expect(screen.getByText(/02/i)).toBeInTheDocument()
  expect(screen.getByText(/03/i)).toBeInTheDocument()
  expect(screen.getByText(/04/i)).toBeInTheDocument()
  expect(screen.getByText(/05/i)).toBeInTheDocument()
  expect(screen.getByText(/makai/i)).toBeInTheDocument()
  expect(screen.getByText(/good samples: 1/i)).toBeInTheDocument()
  expect(screen.getByText(/sample failed: 1/i)).toBeInTheDocument()

  // test for unused sample
  expect(screen.getByTestId(/sample_content_1/i)).toHaveClass('bg-gray-300')

  // test for partial sample
  expect(screen.getByTestId(/sample_content_2/i)).toHaveClass('bg-yellow-300')

  // test for good sample
  expect(screen.getByTestId(/sample_content_5/i)).toHaveClass('bg-green-600')

  // test for failed sample
  expect(screen.getByTestId(/sample_content_4/i)).toHaveClass('bg-amber-500')
})
