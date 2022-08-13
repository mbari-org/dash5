import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { AccordionCells, AccordionCellsProps } from './AccordionCells'
import { Virtualizer } from '../Cells'

export default {
  title: 'Navigation/AccordionCells',
  component: AccordionCells,
} as Meta

const Template: Story<AccordionCellsProps> = (args) => (
  <div className="w-90 relative flex h-64 flex-col border border-stone-300">
    <h1 className="bg-stone-300 p-2 text-sm font-bold">Some Example Header</h1>
    <AccordionCells {...args} />
  </div>
)

const args: AccordionCellsProps = {
  cellAtIndex: (index: number, _virtualizer: Virtualizer) => {
    return <div className="border-b border-stone-100 p-2">Cell {index}</div>
  },
  count: 100,
  loading: false,
}

export const Standard = Template.bind({})
Standard.args = args

export const Loading = Template.bind({})
Loading.args = { ...args, loading: true }
