import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { ParameterTable, ParameterTableProps } from './ParameterTable'

export default {
  title: 'Tables/ParameterTable',
  component: ParameterTable,
} as Meta

const Template: Story<ParameterTableProps> = (args) => (
  <ParameterTable {...args} />
)

const args: ParameterTableProps = {
  parameters: [
    {
      name: 'Repeat',
      description:
        'Number of times the vehicle should try to cycle through waypoints',
      defaultValue: '1 count',
      overrideValue: '2 counts',
    },
    {
      name: 'Speed',
      description: 'Speed while performing the YoYo behavior',
      defaultValue: '1 meter_per_second',
    },
    {
      name: 'CaptureRadius',
      description: 'Speed while performing the YoYo behavior',
      defaultValue: 'NaN meters',
    },
    {
      name: 'YoYoMinDepth',
      description: 'Minimum depth while performing the YoYo behavior',
      defaultValue: '2 meters',
    },
    {
      name: 'YoYoMaxDepth',
      description: 'Maximum depth while performing the YoYo behavior',
      defaultValue: '200 meters',
      overrideValue: '80 meters',
      dvlOff: true,
    },
  ],
  onVerifyValue: (value: string) => `${value} √`,
}

export const Standard = Template.bind({})
Standard.args = args
Standard.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=5445%3A808',
  },
}

export const Warning = Template.bind({})
Warning.args = {
  ...args,
  parameters: [
    {
      name: 'MissionTimeout',
      description: 'Maximum duration of mission',
      defaultValue: '2 hours',
    },
    {
      name: 'MaxDepth',
      description: 'Maximum allowable depth during the mission',
      defaultValue: '200 meters',
      dvlOff: true,
    },
    {
      name: 'MinAltitude',
      description: 'Maximum allowable depth during the mission',
      defaultValue: '200 meters',
      dvlOff: true,
    },
    {
      name: 'MinOffshore',
      description: 'Minimum distance from short to maintain',
      defaultValue: '2000 meters',
    },
  ],
}
Warning.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=5450%3A924',
  },
}
