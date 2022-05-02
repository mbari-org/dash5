import React, { useCallback, useEffect, useRef, useState } from 'react'
import { faClock } from '@fortawesome/pro-regular-svg-icons'
import { Field, FieldProps, getErrorMessage } from './Field'
import { Input } from './Input'
import { DateTime } from 'luxon'
import { Calendar, ClockView } from '@material-ui/pickers'
import { Overlay } from '../Overlay'

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

    useEffect(() => {
      const {
        top = 0,
        left: x = 0,
        height = 0,
      } = inputRef?.current?.getBoundingClientRect() ?? {}
      const y = top + height
      if (getPos?.x !== x || getPos?.y !== y) {
        setPos({ x, y })
      }
    }, [inputRef, getPos, setPos])

    // Manage the current date value
    const [lastDateFromValue, setLastDateFromValue] =
      useState<undefined | string>()
    const [selectedDate, setDateChange] = useState<DateTime | null>(null)
    const handleDateChange = (date: DateTime | null) => {
      setDateChange(date)
      if (handleChange) {
        handleChange(date?.toISO() ?? '')
      }
    }

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
              )?.toFormat('h:mm a, MMM, d yyyy') ?? ' '
            }
            onChange={() => {}}
            aria-label={'date picker'}
          />
          {focused && (
            <Overlay>
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
                  <ClockView
                    date={selectedDate ?? DateTime.local()}
                    type="hours"
                    onHourChange={handleDateChange}
                    onMinutesChange={handleDateChange}
                    onSecondsChange={handleDateChange}
                  />
                </div>
              </div>
            </Overlay>
          )}
          {/* This hidden input and forward ref maintains the actual value controlled by 'useForm' */}
          <input type="hidden" name={name} ref={forwardedRef} />
        </Field>
      </>
    )
  }
)

DateField.displayName = 'Fields.DateField'
