import React, { useEffect, useRef, useState } from 'react'
import { faCalendarAlt } from '@fortawesome/pro-regular-svg-icons'
import { faArrowLeft, faArrowRight } from '@fortawesome/pro-solid-svg-icons'
import { MiniCal, RangeDirection } from './MiniCal'
import { Field } from './Field'
import { Input, InputProps } from './Input'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Overlay } from '../Overlay'
import clsx from 'clsx'
import { DateTime } from 'luxon'
import { IconProp } from '@fortawesome/fontawesome-svg-core'

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
  onDateChange?: (dates: DateTime[], direction?: RangeDirection) => void
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
   * If true the field will allow the user to select two dates.
   */
  range?: boolean
  /**
   * Limit the direction of the range selection when applicable.
   */
  rangeDirection?: RangeDirection
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
    {
      alignCalendar = 'left',
      initialDate,
      dates,
      onDateChange: handleSelectedDate,
      selectedDateFormat = 'MMMM d, yyyy',
      disabled,
      errorMessage,
      required,
      label,
      name,
      placeholder,
      className,
      range,
      rangeDirection = 'both',
      ...InputProps
    },
    forwardedRef
  ) => {
    const [trackedDates, setTrackedDates] = useState<DateTime[] | undefined>()
    const [direction, setDirection] = useState<RangeDirection | undefined>()
    const [focused, setFocus] = useState(false)
    const buttonRef = useRef<HTMLButtonElement>(null)

    const start =
      trackedDates?.[0] ?? dates?.[0] ?? initialDate ?? DateTime.utc()
    const end = trackedDates?.[1] ?? dates?.[1] ?? initialDate ?? DateTime.utc()
    const currentDirection =
      (start.diff(end, 'days').days ?? 0) > 0 ? 'backward' : 'forward'

    useEffect(() => {
      if (currentDirection !== direction) {
        setDirection(currentDirection)
      }
    }, [currentDirection, direction, setDirection, start, end])

    const toggleFocus: React.MouseEventHandler<HTMLButtonElement> = (e) => {
      e.preventDefault()
      setFocus(!focused)
    }

    const dismissAndHandleSelectedDate = (
      dates: DateTime[],
      direction?: RangeDirection
    ) => {
      setTrackedDates(dates)
      handleSelectedDate?.(dates, direction)
      setDirection(direction)
      setFocus(false)
    }
    const textValue = dates
      ?.map((date) => date.toFormat(selectedDateFormat))
      .join(SEPARATOR)

    const { x, y, height } = buttonRef.current?.getBoundingClientRect() ?? {}
    const sortedDates = [...(dates ?? [])].sort()
    return (
      <>
        <Field
          label={label}
          errorMessage={errorMessage}
          name={name}
          required={required}
          disabled={disabled}
          className={className}
        >
          <button
            className="relative flex flex-grow rounded border bg-white p-2 pl-4 pr-8"
            onClick={toggleFocus}
            type="button"
            ref={buttonRef}
          >
            {(dates?.length ?? 0) > 0 ? (
              <>
                <p
                  className={clsx(
                    SELECTED_DATE_STYLE,
                    direction === 'backward'
                      ? 'bg-indigo-600'
                      : 'bg-emerald-600'
                  )}
                >
                  {sortedDates[0]?.toFormat(selectedDateFormat)}
                </p>
                {(dates?.length ?? 0) > 1 ? (
                  <>
                    <FontAwesomeIcon
                      icon={
                        (direction === 'backward'
                          ? faArrowLeft
                          : faArrowRight) as IconProp
                      }
                      className="my-auto mx-2"
                    />
                    <p
                      className={clsx(
                        SELECTED_DATE_STYLE,
                        direction === 'forward'
                          ? 'bg-indigo-600'
                          : 'bg-emerald-600'
                      )}
                    >
                      {sortedDates[1]?.toFormat(selectedDateFormat)}
                    </p>
                  </>
                ) : null}
              </>
            ) : (
              <p className="text-gray-400">
                {placeholder ??
                  clsx(
                    'i.e. ',
                    DateTime.utc().toFormat(selectedDateFormat),
                    range && SEPARATOR,
                    range &&
                      DateTime.utc()
                        .plus({ weeks: 1 })
                        .toFormat(selectedDateFormat)
                  )}
              </p>
            )}
            <div className="absolute inset-y-0 right-0 flex text-stone-300">
              <FontAwesomeIcon
                icon={faCalendarAlt as IconProp}
                className="my-auto mr-2 text-gray-500"
              />
            </div>
          </button>
          <Input
            {...InputProps}
            name={name}
            type="hidden"
            ref={forwardedRef}
            value={textValue}
            className={clsx(focused && 'ring-focus ring-4 ring-indigo-500')}
          />
        </Field>
        {focused ? (
          <Overlay>
            <div
              className={`fixed z-50 my-auto mt-1 flex-shrink-0 bg-white shadow transition-shadow duration-500 ease-in-out hover:shadow-lg`}
              style={{
                top: (y ?? 0) + (height ?? 0),
                left: x,
              }}
            >
              <MiniCal
                initialDate={initialDate}
                selectedDates={dates}
                onDateSelected={dismissAndHandleSelectedDate}
                monthsToShow={range ? 2 : 1}
                className="w-64"
                range={range}
                rangeDirection={rangeDirection}
              />
            </div>
            <button
              className="fixed top-0 left-0 z-40 h-screen w-screen bg-white opacity-25"
              onClick={toggleFocus}
            />
          </Overlay>
        ) : null}
      </>
    )
  }
)

DateField.displayName = 'Fields.DateField'
