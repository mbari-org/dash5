import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import {
  CellVirtualizer,
  CellVirtualizerProps,
  Virtualizer,
} from './CellVirtualizer'
import { Running } from './VehicleCell.stories'
import { VehicleCell, VehicleCellProps } from './VehicleCell'
import { VehicleProps } from '../Diagrams'
import { VehicleHeader } from '../Navigation'

export default {
  title: 'CellVirtualizer',
  component: CellVirtualizer,
} as Meta

const Template: Story<CellVirtualizerProps> = (args) => (
  <CellVirtualizer {...args} />
)

const ToggleableVehicleCell: React.FC<{
  index: number
  virtualizer: Virtualizer
}> = ({ index, virtualizer }) => {
  const [isOpen, setIsOpen] = React.useState(true)
  return (
    <div className="flex flex-col border-b border-stone-200">
      <VehicleHeader
        color="#028390"
        name="Brizo"
        deployment="Brizo 7 Ecohab"
        onToggle={() => {
          setIsOpen(!isOpen)
          virtualizer.measure()
        }}
        open={isOpen}
        className={'w-full'}
      />
      {isOpen && (
        <VehicleCell
          {...(Running.args as VehicleCellProps)}
          vehicle={{
            ...(Running.args?.vehicle as VehicleProps),
            textVehicle: `Vehicle ${index}`,
          }}
        />
      )}
    </div>
  )
}

const args: CellVirtualizerProps = {
  className: 'h-96 w-[438px]',
  count: 100,
  estimateSize: () => 100,
  style: {
    height: 800,
  },
  cellAtIndex: (index: number, virtualizer: Virtualizer) => (
    <ToggleableVehicleCell index={index} virtualizer={virtualizer} />
  ),
}

export const Standard = Template.bind({})
Standard.args = args
