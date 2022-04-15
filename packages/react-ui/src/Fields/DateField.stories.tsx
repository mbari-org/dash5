import React, { useCallback, useState } from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { DateField, DateFieldProps } from './DateField'
import { DateTime } from 'luxon'

export default {
  title: 'Fields/DateField',
  component: DateField,
} as Meta

const Template: Story<DateFieldProps> = (args) => {
  const [currentValue, setCurrentValue] = useState(args.value)
  const handleChange = useCallback(
    (newValue: string) => {
      setCurrentValue(newValue)
    },
    [setCurrentValue]
  )
  // const handleSelectedDate = (dates: DateTime[]) => setSelectedDate(dates)
  return (
    <div className="rounded border p-4">
      <DateField {...args} value={currentValue} onChange={handleChange} />
    </div>
  )
}

const args: DateFieldProps = { name: 'startsAt', label: 'Starts At' }

export const Standard = Template.bind({})
Standard.args = args

export const CustomPlaceholder = Template.bind({})
CustomPlaceholder.args = { ...args, placeholder: 'When does the event begin?' }

export const WithExistingValue = Template.bind({})
WithExistingValue.args = {
  ...args,
  value: DateTime.local().minus({ days: 3, months: 2 }).toISO(),
}

export const Error = Template.bind({})
Error.args = {
  ...args,
  required: true,
  errorMessage: 'Please select a valid date.',
}

export const Disabled = Template.bind({})
Disabled.args = { ...args, disabled: true }
