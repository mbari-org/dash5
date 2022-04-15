import React, { useEffect, useRef, useState } from 'react'
import { faCalendarAlt } from '@fortawesome/pro-regular-svg-icons'
import { faArrowLeft, faArrowRight } from '@fortawesome/pro-solid-svg-icons'
import { Field } from './Field'
import { Input, InputProps } from './Input'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Overlay } from '../Overlay'
import clsx from 'clsx'
import { DateTime } from 'luxon'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { DateTimePicker } from '@material-ui/pickers'

export interface DateFieldProps extends InputProps {
  /**
   * An initial date to display
   */
  initialDate?: DateTime
  /**
   * Indicates whether or not to align the calendar on the left of right side of the Text.
   */
  alignCalendar?: 'left' | 'right'
  /**
   * A date selected on this widget
   */
  dates?: DateTime[]
  /**
   * The format the selected date should be rendered in. Defaults to "YYYY-MM-DD"
   */
  selectedDateFormat?: string
  /**
   * A callback that renders when a date on the calendar has been selected.
   */
  onDateChange?: (dates: DateTime) => void
  /**
   * Disables the field from user interaction.
   */
  disabled?: boolean
  /**
   * A placeholder string. Defaults to the date format if not supplied.
   */
  placeholder?: string
  /**
   * An optional form label to display.
   */
  label?: string
  /**
   * The name of the associated Text.
   */
  name: string
  /**
   * Indicates if the content of the field is required.
   */
  required?: boolean
  /**
   * Extend the class name to add your own styles to the rendered calendars.
   */
  className?: string
  /**
   * An optional inline error message.
   */
  errorMessage?: string
}

export const SEPARATOR = ' to '

const SELECTED_DATE_STYLE =
  'text-white font-bold text-sm bg-indigo-600 rounded p-1'

export const DateField = React.forwardRef<HTMLInputElement, DateFieldProps>(
  (
    { disabled, errorMessage, required, label, name, className },
    forwardedRef
  ) => {
    const [selectedDate, handleDateChange] = useState(null as DateTime | null)
    const [date, setDate] = useState<Date | undefined>()
    const [focused, setFocus] = useState(false)
    const buttonRef = useRef<HTMLButtonElement>(null)

    const toggleFocus: React.MouseEventHandler<HTMLButtonElement> = (e) => {
      e.preventDefault()
      setFocus(!focused)
    }

    return (
      <>
        <DateTimePicker
          value={selectedDate}
          onChange={(date) => handleDateChange(date)}
          label="With Today Button"
        />
      </>
    )
  }
)

DateField.displayName = 'Fields.DateField'
