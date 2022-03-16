import React, { useState, useEffect } from 'react'
import { DateTime, Interval } from 'luxon'
import { Icon } from '../Navigation'
import {
  faChevronLeft,
  faChevronRight,
  faChevronDoubleLeft,
  faChevronDoubleRight,
} from '@fortawesome/pro-regular-svg-icons'
import clsx from 'clsx'

export type RangeDirection = 'forward' | 'backward' | 'both'

export interface MiniCalProps {
  /**
   * An initial date to display
   */
  initialDate?: DateTime
  /**
   * A date selected on this widget
   */
  selectedDates?: DateTime[]
  /**
   * A callback that renders when a date on the calendar has been selected.
   */
  onDateSelected?: (dates: DateTime[], direction?: RangeDirection) => void
  /**
   * The amount of months to render. Defaults to 1.
   */
  monthsToShow?: 1 | 2 | 3 | 6
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
}

export const MiniCal: React.FC<MiniCalProps> = ({
  initialDate,
  selectedDates,
  onDateSelected: handleSelectedDates,
  monthsToShow = 1,
  className,
  range,
  rangeDirection = 'both',
}) => {
  const [hoverDate, setHoverDate] = useState<DateTime | null>(null)
  const [trackedDates, setTrackedDates] = useState<DateTime[]>([])
  const [increment, setIncrement] = useState(0)

  const handleIncrementClick =
    (newIncrement: number): React.MouseEventHandler =>
    (e) => {
      e.preventDefault()
      setIncrement(increment + newIncrement)
    }

  useEffect(() => {
    setIncrement(0)
  }, [selectedDates, initialDate])

  const originDate = selectedDates?.[0] ?? initialDate ?? DateTime.utc()
  const monthStart = (originDate.isValid ? originDate : DateTime.utc())
    .startOf('month')
    .plus({ months: increment })

  const handleDateClick =
    (date: DateTime) => (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setTrackedDates(
        range && trackedDates.length < 2 ? [...trackedDates, date] : [date]
      )
    }

  useEffect(() => {
    if (trackedDates.length === 2 || (!range && trackedDates.length === 1)) {
      const diff = trackedDates[0]
        .diff(trackedDates[1] ?? trackedDates[0])
        .as('days')
      handleSelectedDates?.(trackedDates, diff < 1 ? 'forward' : 'backward')
    }
  }, [trackedDates, handleSelectedDates, range])

  const gridClassNames =
    monthsToShow > 2
      ? 'grid grid-cols-3 gap-4'
      : monthsToShow > 1
      ? 'grid grid-cols-2 gap-4'
      : null

  return (
    <div className="h-full p-2 px-4">
      <div className="relative flex flex-col">
        <nav className="absolute inset-x-0 top-0 flex rounded p-2">
          <button
            onClick={handleIncrementClick(-12)}
            className="absolute left-0 top-0 p-2"
          >
            <Icon icon={faChevronDoubleLeft} mode="secondary" />
          </button>
          <button
            onClick={handleIncrementClick(-1)}
            className="absolute left-0 top-0 ml-8 p-2"
          >
            <Icon icon={faChevronLeft} mode="secondary" />
          </button>

          <button
            onClick={handleIncrementClick(1)}
            className="absolute top-0 right-0 mr-8 p-2"
          >
            <Icon icon={faChevronRight} mode="secondary" />
          </button>
          <button
            onClick={handleIncrementClick(12)}
            className="absolute right-0 top-0 p-2"
          >
            <Icon icon={faChevronDoubleRight} mode="secondary" />
          </button>
        </nav>
        <div className={clsx(gridClassNames, 'flex-grow')}>
          {[...Array(monthsToShow)].map((_, months) => (
            <div
              className={clsx('flex flex-col', className)}
              key={`month-${months}`}
            >
              <h3 className="mx-auto flex-grow p-2 text-center text-sm font-semibold">
                {monthStart.plus({ months }).toFormat('MMM, yyyy')}
              </h3>
              {new Array(6).fill('').map((_, weeks) => {
                return (
                  <div
                    className="grid grid-cols-7"
                    key={`minical-week-${weeks}`}
                  >
                    {new Array(7).fill('').map((_, days) => {
                      const currentMonth = monthStart
                        .plus({ months })
                        .startOf('month')
                      const day = currentMonth
                        .plus({ weeks })
                        .startOf('week')
                        .plus({ days: days - 1 })
                      const inMonth = currentMonth.month === day.month
                      const isIncompleteRange =
                        range && trackedDates.length === 1
                      const isBefore = trackedDates[0]?.diff(day).as('days') > 0
                      const disabled =
                        !inMonth ||
                        (isIncompleteRange &&
                          !trackedDates[0]?.equals(day) &&
                          ((rangeDirection === 'forward' && isBefore) ||
                            (rangeDirection === 'backward' && !isBefore)))
                      const isSelectedDate = trackedDates[0]?.equals(day)
                      const start = trackedDates[0] ?? selectedDates?.[0]
                      const end =
                        selectedDates?.length === 2 && trackedDates.length < 1
                          ? selectedDates?.[1]
                          : hoverDate
                      const rangeValues = [start, end].sort()
                      const isInRange =
                        range &&
                        rangeValues[0] &&
                        rangeValues[1] &&
                        Interval.fromDateTimes(
                          rangeValues[0],
                          rangeValues[1].plus({ day: 1 })
                        ).contains(day)

                      return (
                        <li
                          className={clsx(
                            'flex border-2 text-xs transition duration-100 ease-out',
                            disabled
                              ? 'pointer-events-none cursor-not-allowed border-transparent bg-gray-100 text-gray-400'
                              : start?.equals(day)
                              ? 'border-emerald-600 bg-white text-emerald-600'
                              : end?.equals(day)
                              ? 'border-indigo-600 bg-white text-indigo-600'
                              : isSelectedDate || isInRange
                              ? 'bg-indigo-400 text-white hover:bg-indigo-600'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-300'
                          )}
                          key={`date-${months}-${weeks}-${days}`}
                          onMouseOver={() => setHoverDate(day)}
                        >
                          <button
                            className="flex flex-grow p-1"
                            onClick={handleDateClick(day.toUTC())}
                          >
                            <span className="m-auto">{day.toFormat('d')}</span>
                          </button>
                        </li>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
