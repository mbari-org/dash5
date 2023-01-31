import React, { useCallback, useEffect, useRef, useState } from 'react'
import { faClock } from '@fortawesome/pro-regular-svg-icons'
import { Field, FieldProps, getErrorMessage } from './Field'
import { Input } from './Input'
import { DateTime } from 'luxon'
import { Calendar, ClockView } from '@material-ui/pickers'
import { ClockViewType } from '@material-ui/pickers/constants/ClockType'
import clsx from 'clsx'

export interface DateFieldInputProps {
  /**
   * An initial date to display
   */
  value?: string
  /**
   * The format the selected date should be rendered in. Defaults to "YYYY-MM-DD"
   */
  selectedDateFormat?: string
  /**
   * A callback that renders when a date on the calendar has been selected.
   */
  onChange?: (value: string) => void
  /**
   * Disables the field from user interaction.
   */
  disabled?: boolean
  /**
   * A placeholder string. Defaults to the date format if not supplied.
   */
  placeholder?: string
  /**
   * A timeZone to set on the date preview.
   */
  timeZone?: string
}

const styles = {
  timeButton: 'rounded border border-stone-200 p-2 hover:border-teal-500',
}

export type DateFieldProps = DateFieldInputProps & FieldProps

export const DateField = React.forwardRef<HTMLInputElement, DateFieldProps>(
  (
    {
      disabled,
      errorMessage,
      required,
      label,
      name,
      className,
      errors,
      value,
      placeholder,
      timeZone,
      onChange: handleChange,
      ...fieldProps
    },
    forwardedRef
  ) => {
    const [calendarStyles, setCalendarStyles] = useState({ top: 0, left: 0 })

    // Maintain a reference to the input element so we can focus it
    const inputRef = useRef<HTMLInputElement | null>(null)
    const determinedErrorMessage = getErrorMessage({
      name,
      errorMessage,
      errors,
    })

    // Manage the current date value
    const [lastDateFromValue, setLastDateFromValue] = useState<
      undefined | string
    >()
    const [selectedDate, setDateChange] = useState<DateTime | null>(null)
    const handleDateChange = useCallback(
      (date: DateTime | null) => {
        setDateChange(date)
        if (handleChange) {
          handleChange(date?.toISO() ?? '')
        }
      },
      [handleChange, setDateChange]
    )

    useEffect(() => {
      if (lastDateFromValue !== value) {
        setLastDateFromValue(value)
        const date = DateTime.fromISO(value ?? '')
        if (!date.isValid) {
          handleDateChange(null)
        } else if (date.toISO() !== selectedDate?.toISO()) {
          handleDateChange(date)
        }
      }
    }, [value, selectedDate, handleDateChange, lastDateFromValue])

    // Manage when to display the inline date/time picker.
    const [focused, setFocus] = useState(false)
    const [timeMode, setTimeMode] = useState<ClockViewType>('hours')
    const [interacting, setInteracting] = useState(false)
    const blurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
    const handleFocus = useCallback(
      (newValue: boolean) => () => {
        const domRect = inputRef.current?.getBoundingClientRect()

        setCalendarStyles({
          top: domRect?.bottom ?? 0,
          left: domRect?.left ?? 0,
        })

        if (blurTimeout.current) {
          clearTimeout(blurTimeout.current)
        }
        if (!newValue && interacting) {
          return
        }
        blurTimeout.current = setTimeout(
          () => {
            setFocus(newValue)
            if (newValue) inputRef?.current?.focus()
          },
          newValue ? 0 : 50
        )
      },
      [setFocus, blurTimeout, interacting]
    )
    const handleInteraction = (newValue: boolean) => () => {
      setInteracting(newValue)
    }
    const handleMouseUp = () => {
      inputRef.current?.focus()
    }

    const handleTimeMode = (newTimeMode: ClockViewType) => () => {
      setTimeMode(newTimeMode)
    }

    const toggleAmPm = () => {
      if (selectedDate) {
        const hours = selectedDate.toFormat('a') === 'AM' ? 12 : -12
        handleDateChange(selectedDate.plus({ hours }))
      }
    }

    return (
      <>
        <Field
          name={name}
          disabled={disabled}
          required={required}
          label={label}
          className={className}
          errorMessage={determinedErrorMessage}
          icon={faClock}
          {...fieldProps}
        >
          <Input
            ref={inputRef}
            disabled={disabled}
            name={name}
            className="pl-8"
            onFocus={handleFocus(true)}
            onBlur={handleFocus(false)}
            placeholder={placeholder}
            value={
              (timeZone
                ? selectedDate?.setZone(timeZone)
                : selectedDate
              )?.toFormat('h:mm:ss a, MMM, d yyyy') ?? ' '
            }
            onChange={() => {
              return
            }}
            aria-label={'date picker'}
          />
          {focused && (
            <div
              className="fixed z-50 mt-2 flex border border-stone-200 bg-white p-2 shadow-lg"
              style={calendarStyles}
              onMouseEnter={handleInteraction(true)}
              onMouseLeave={handleInteraction(false)}
              onMouseUp={handleMouseUp}
              role="button"
              tabIndex={0}
            >
              <div className="relative w-1/2 flex-grow overflow-hidden px-2">
                <Calendar
                  date={selectedDate ?? DateTime.local()}
                  onChange={handleDateChange}
                  onMonthChange={handleDateChange}
                />
              </div>
              <div className="relative w-1/2 flex-grow overflow-hidden px-2">
                <div className="flex justify-center">
                  <button
                    onClick={handleTimeMode('hours')}
                    className={clsx(
                      styles.timeButton,
                      timeMode === 'hours' && 'border-teal-300'
                    )}
                  >
                    {selectedDate?.toFormat('hh') ?? '00'}
                  </button>
                  <span className="my-auto px-1">:</span>
                  <button
                    onClick={handleTimeMode('minutes')}
                    className={clsx(
                      styles.timeButton,
                      timeMode === 'minutes' && 'border-teal-300'
                    )}
                  >
                    {selectedDate?.toFormat('mm') ?? '00'}
                  </button>
                  <span className="my-auto px-1">:</span>
                  <button
                    onClick={handleTimeMode('seconds')}
                    className={clsx(
                      styles.timeButton,
                      timeMode === 'seconds' && 'border-teal-300'
                    )}
                  >
                    {selectedDate?.toFormat('ss') ?? '00'}
                  </button>
                  <button
                    onClick={toggleAmPm}
                    className={clsx(styles.timeButton, 'ml-2')}
                  >
                    {selectedDate?.toFormat('a') ?? 'AM'}
                  </button>
                </div>
                <ClockView
                  date={selectedDate ?? DateTime.local()}
                  type={timeMode}
                  onHourChange={handleDateChange}
                  onMinutesChange={handleDateChange}
                  onSecondsChange={handleDateChange}
                />
              </div>
            </div>
          )}
          {/* This hidden input and forward ref maintains the actual value controlled by 'useForm' */}
          <input type="hidden" name={name} ref={forwardedRef} />
        </Field>
      </>
    )
  }
)

DateField.displayName = 'Fields.DateField'
