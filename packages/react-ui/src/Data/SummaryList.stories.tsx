import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { SummaryList, SummaryListProps } from './SummaryList'

export default {
  title: 'Data/SummaryList',
  component: SummaryList,
} as Meta

const Template: Story<SummaryListProps> = (args) => <SummaryList {...args} />

const args: SummaryListProps = {
  header: 'ESTIMATES',
  values: [
    <div key={1}>
      <span className="mr-1 font-medium">Total mission time:</span>
      <span> 6 hours 10 minutes</span>
    </div>,
    <div key={2}>
      <span className="mr-1 font-medium">Time in transit:</span>
      <span>4 hours</span>
    </div>,
    <div key={3}>
      <span className="mr-1 font-medium">Travel distance:</span>
      <span>7.2km</span>
    </div>,
    <div key={4}>
      <span className="mr-1 font-medium">Bottom depth:</span>
      <span>100 to 180 meters</span>
    </div>,
  ],
}

export const Standard = Template.bind({})
Standard.args = args

Standard.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=1409%3A613',
  },
}
