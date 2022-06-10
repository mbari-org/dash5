import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { CellVirtualizer, CellVirtualizerProps } from './CellVirtualizer'
import { Running } from './VehicleCell.stories'
import { VehicleCell, VehicleCellProps } from './VehicleCell'
import { VehicleProps } from '../Diagrams'

export default {
  title: 'CellVirtualizer',
  component: CellVirtualizer,
} as Meta

const Template: Story<CellVirtualizerProps> = (args) => (
  <CellVirtualizer {...args} />
)

const args: CellVirtualizerProps = {
  className: 'h-96 w-[438px]',
  count: 100,
  estimateSize: () => 100,
  style: {
    height: 800,
  },
  cellAtIndex: (index: number) => (
    <div className="border-b border-stone-200">
      <VehicleCell
        {...(Running.args as VehicleCellProps)}
        vehicle={{
          ...(Running.args?.vehicle as VehicleProps),
          textVehicle: `Vehicle ${index}`,
        }}
      />
    </div>
  ),
}

export const Standard = Template.bind({})
Standard.args = args
