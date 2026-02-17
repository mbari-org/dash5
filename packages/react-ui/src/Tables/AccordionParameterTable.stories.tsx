import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'
import {
  AccordionParameterTable,
  AccordionParameterTableProps,
} from './AccordionParameterTable'

export default {
  title: 'Tables/AccordionParameterTable',
  component: AccordionParameterTable,
} as Meta

const Template: Story<AccordionParameterTableProps> = (args) => {
  const [open, setOpen] = React.useState(true)
  return (
    <div className="w-full max-w-4xl">
      <AccordionParameterTable
        {...args}
        open={open}
        onToggle={setOpen}
        label={args.label ?? 'Parameters'}
      />
    </div>
  )
}

const args: AccordionParameterTableProps = {
  label: 'Mission Parameters',
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
      description: 'Capture radius for waypoint approach',
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
  onParamUpdate: (name: string, value: string, unit?: string) =>
    console.log('update', { name, value, unit }),
  unitOptions: [
    { name: 'ampere', abbreviation: 'A' },
    { name: 'ampere_hour', abbreviation: 'Ah', baseUnit: 'ampere_second' },
    { name: 'ampere_per_count', abbreviation: 'A/count' },
    { name: 'ampere_per_meter', abbreviation: 'A/m' },
  ],
  onToggle: (_open: boolean) => console.log('toggle', _open),
}

export const Standard = Template.bind({})
Standard.args = args
Standard.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=5445%3A808',
  },
}

export const Loading = Template.bind({})
Loading.args = { ...args, loading: true }
