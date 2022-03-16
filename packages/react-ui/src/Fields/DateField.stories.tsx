import React, { useState } from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { DateField, DateFieldProps } from './DateField'
import { DateTime } from 'luxon'

export default {
  title: 'Fields/DateField',
  component: DateField,
} as Meta

const Template: Story<DateFieldProps> = (args) => {
  const [selectedDates, setSelectedDate] = useState([] as DateTime[])
  const handleSelectedDate = (dates: DateTime[]) => setSelectedDate(dates)
  return (
    <div className="rounded border p-4">
      <DateField
        {...args}
        onDateChange={handleSelectedDate}
        dates={selectedDates}
      />
      <p className="text-md">
        Selected Date:{' '}
        <strong className="font-semibold">
          {selectedDates.map((d) => d.toISODate()).join(' to ')}
        </strong>
      </p>
    </div>
  )
}

const args: DateFieldProps = { name: 'startsAt', label: 'Starts At' }

export const Standard = Template.bind({})
Standard.args = args

export const Range = Template.bind({})
Range.args = { ...args, range: true }

export const RangeForward = Template.bind({})
RangeForward.args = { ...args, range: true, rangeDirection: 'forward' }

export const RangeBackward = Template.bind({})
RangeBackward.args = { ...args, range: true, rangeDirection: 'backward' }

export const CustomPlaceholder = Template.bind({})
CustomPlaceholder.args = { ...args, placeholder: 'When does the event begin?' }

export const CustomDateFormat = Template.bind({})
CustomDateFormat.args = { ...args, selectedDateFormat: 'MMM DD, YYYY' }

export const Required = Template.bind({})
Required.args = { ...args, required: true }

export const Error = Template.bind({})
Error.args = {
  ...args,
  required: true,
  error: 'Please select a valid date.',
}

export const Disabled = Template.bind({})
Disabled.args = { ...args, disabled: true }
