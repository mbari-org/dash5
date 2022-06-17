import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CellVirtualizer } from './CellVirtualizer'

test('should render the virtual container', async () => {
  render(
    <CellVirtualizer cellAtIndex={(index) => <div>{index}</div>} count={10} />
  )
  expect(screen.getByTestId(/virtualized-list/i)).toBeInTheDocument()
})
