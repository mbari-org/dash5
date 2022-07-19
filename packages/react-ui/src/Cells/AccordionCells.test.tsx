import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
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
