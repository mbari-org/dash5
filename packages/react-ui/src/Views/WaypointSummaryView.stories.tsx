import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import {
  WaypointSummaryView,
  WaypointSummaryViewProps,
} from './WaypointSummaryView'

export default {
  title: 'Views/WaypointSummaryView',
  component: WaypointSummaryView,
} as Meta

const Template: Story<WaypointSummaryViewProps> = (args) => (
  <div className="bg-stone-200 p-2">
    <WaypointSummaryView {...args} />
  </div>
)

const args: WaypointSummaryViewProps = {
  waypoints: [
    { name: 'C1', lat: 36.797, long: 127.847 },
    { name: 'M1', lat: 36.797, long: 127.847 },
    { name: 'Custom', lat: 36.797, long: 127.847 },
  ],
  maxWaypoints: 7,
  vehicle: 'Brizo',
  mission: 'sci2',
  estimatedDistance: '7.2 km',
  estimatedBottomDepth: '100-180 m',
  estimatedDuration: '6hrs',
}

export const Standard = Template.bind({})
Standard.args = args
Standard.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=5438%3A727',
  },
}
