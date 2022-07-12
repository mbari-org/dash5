import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import LineChart, { LineChartProps } from './LineChart'
import { DateTime } from 'luxon'

export default {
  title: 'Charts/LineChart',
  component: LineChart,
} as Meta

const Template: Story<LineChartProps> = (args) => (
  <div className="bg-slate-200 p-4">
    <LineChart {...args} />
  </div>
)

const args: LineChartProps = {
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
  yAxisLabel: 'Depth (m)',
}

export const Standard = Template.bind({})
Standard.args = args

export const Inverted = Template.bind({})
Inverted.args = { ...args, inverted: true }

export const NoTitle = Template.bind({})
NoTitle.args = { ...args, title: undefined }

export const Narrow = Template.bind({})
Narrow.args = { ...args, style: { width: 400, height: 400 } }
