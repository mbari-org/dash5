import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { WaypointTable, WaypointTableProps } from './WaypointTable'

export default {
  title: 'Tables/WaypointTable',
  component: WaypointTable,
} as Meta

const Template: Story<WaypointTableProps> = (args) => (
  <WaypointTable {...args} />
)

const args: WaypointTableProps = {
  waypoints: Array(5).fill({
    options: [
      { id: '1', name: '25.0000° N, 71.0000° W' },
      { id: '2', name: '37.0169° N, 122.0025° W' },
    ],
  }),
  onSelectOption: (id) => {
    console.log(id)
  },
  onLocation: () => {
    console.log('on location button clicked')
  },
}

export const Standard = Template.bind({})
Standard.args = args
Standard.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=3622%3A640',
  },
}
