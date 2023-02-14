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
      value: '1',
      unit: 'count',
      overrideValue: '2',
    },
    {
      name: 'Speed',
      description: 'Speed while performing the YoYo behavior',
      value: '2',
      unit: 'meter_per_second',
    },
    {
      name: 'CaptureRadius',
      description: 'Speed while performing the YoYo behavior',
      value: 'NaN',
      unit: 'meter',
    },
    {
      name: 'YoYoMinDepth',
      description: 'Minimum depth while performing the YoYo behavior',
      value: '2',
      unit: 'meter',
    },
    {
      name: 'YoYoMaxDepth',
      description: 'Maximum depth while performing the YoYo behavior',
      value: '200',
      unit: 'meter',
      overrideValue: '80',
      dvlOff: true,
    },
  ],
  onVerifyValue: (value: string) => `${value} √`,
  onParamUpdate: (value: string) => console.log(value),
  unitOptions: [
    {
      name: 'ampere',
      abbreviation: 'A',
    },
    {
      name: 'ampere_hour',
      abbreviation: 'Ah',
      baseUnit: 'ampere_second',
    },
    {
      name: 'ampere_per_count',
      abbreviation: 'A/count',
    },
    {
      name: 'ampere_per_meter',
      abbreviation: 'A/m',
    },
  ],
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
      value: '2',
      unit: 'hours',
    },
    {
      name: 'MaxDepth',
      description: 'Maximum allowable depth during the mission',
      value: '200',
      unit: 'meters',
      dvlOff: true,
    },
    {
      name: 'MinAltitude',
      description: 'Maximum allowable depth during the mission',
      value: '200',
      unit: 'meters',
      dvlOff: true,
    },
    {
      name: 'MinOffshore',
      description: 'Minimum distance from short to maintain',
      value: '2000',
      unit: 'meters',
    },
  ],
}
Warning.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=5450%3A924',
  },
}
