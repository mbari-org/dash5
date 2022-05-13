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
    'Total mission time: 12 minutes of 6h 10m',
    'Time in transit: 1.5 of 4 hours complete',
    'Travel distance: 3.6 of 7.2km complete',
    'Bottom depth: 100 to 180 meters',
  ],
}

export const Standard = Template.bind({})
Standard.args = args
