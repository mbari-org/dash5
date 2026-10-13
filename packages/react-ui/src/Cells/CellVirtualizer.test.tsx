import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import * as ReactVirtual from '@tanstack/react-virtual'
import { CellVirtualizer } from './CellVirtualizer'

test('should render the virtual container', async () => {
  render(
    <CellVirtualizer cellAtIndex={(index) => <div>{index}</div>} count={10} />
  )
  expect(screen.getByTestId(/virtualized-list/i)).toBeInTheDocument()
})

test('uses default overscan of 5 when not specified', () => {
  const spy = jest.spyOn(ReactVirtual, 'useVirtualizer')
  render(
    <CellVirtualizer cellAtIndex={(index) => <div>{index}</div>} count={10} />
  )
  expect(spy).toHaveBeenCalledWith(expect.objectContaining({ overscan: 5 }))
  spy.mockRestore()
})

test('passes caller-provided overscan value to the virtualizer', () => {
  const spy = jest.spyOn(ReactVirtual, 'useVirtualizer')
  render(
    <CellVirtualizer
      cellAtIndex={(index) => <div>{index}</div>}
      count={20}
      overscan={20}
    />
  )
  expect(spy).toHaveBeenCalledWith(expect.objectContaining({ overscan: 20 }))
  spy.mockRestore()
})
