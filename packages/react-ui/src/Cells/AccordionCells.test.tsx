import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import * as ReactVirtual from '@tanstack/react-virtual'
import { AccordionCells, AccordionCellsProps } from './AccordionCells'
import { Virtualizer } from '../Cells'

const props: AccordionCellsProps = {
  cellAtIndex: (index: number, _virtualizer: Virtualizer) => {
    return <div>{index}</div>
  },
  count: 100,
}

test('should render the component', async () => {
  expect(() => render(<AccordionCells {...props} />)).not.toThrow()
})

test('forwards overscan to CellVirtualizer when provided', () => {
  const spy = jest.spyOn(ReactVirtual, 'useVirtualizer')
  render(<AccordionCells {...props} overscan={50} />)
  expect(spy).toHaveBeenCalledWith(expect.objectContaining({ overscan: 50 }))
  spy.mockRestore()
})

test('uses CellVirtualizer default overscan when overscan is not provided', () => {
  const spy = jest.spyOn(ReactVirtual, 'useVirtualizer')
  render(<AccordionCells {...props} />)
  // CellVirtualizer defaults overscan to 5 when not passed
  expect(spy).toHaveBeenCalledWith(expect.objectContaining({ overscan: 5 }))
  spy.mockRestore()
})
