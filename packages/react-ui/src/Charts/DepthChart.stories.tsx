import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import DepthChart, { DepthChartProps } from './DepthChart'
import { DateTime } from 'luxon'

export default {
  title: 'Charts/DepthChart',
  component: DepthChart,
} as Meta

const Template: Story<DepthChartProps> = (args) => <DepthChart {...args} />

const args: DepthChartProps = {
  data: new Array(60).fill('').map((_, i) => ({
    value: Math.random() * 200,
    timestamp: DateTime.now()
      .minus({ hours: 60 - i })
      .toMillis(),
  })),
  name: 'Depth',
  title: 'Depth Chart',
  style: {
    width: '100%',
    height: 400,
  },
}

export const Standard = Template.bind({})
Standard.args = args
