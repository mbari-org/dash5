import React, { useState, useEffect } from 'react'
import { DateTime } from 'luxon'
import { faChevronLeft } from '@fortawesome/pro-regular-svg-icons/faChevronLeft'
import { faChevronRight } from '@fortawesome/pro-regular-svg-icons/faChevronRight'
import { faChevronDoubleLeft } from '@fortawesome/pro-regular-svg-icons/faChevronDoubleLeft'
import { faChevronDoubleRight } from '@fortawesome/pro-regular-svg-icons/faChevronDoubleRight'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { concatStyles } from 'utils'
import { IconProp } from '@fortawesome/fontawesome-svg-core'

export interface DateSelectorProps {
  /**
   * An initial date to display
   */
  initialDate?: string
  /**
   * If true the date props will be parsed as formats as opposed to ISO strings.
   */
  useFormattedValue?: boolean
  /**
   * A date selected on this widget
   */
  selectedDate?: string
  /**
   * The format the selected date should be rendered in. Defaults to "yyyy-MM-dd"
   */
  dateFormat?: string
  /**
   * A callback that renders when a date on the calendar has been selected.
   */
  onDateSelected?: (date: string) => void
}

const DATE_STYLES = 'flex transition duration-100 ease-out mb-1 ml-1 text-xs'
const DESELECTED_DATE_STYLES = 'bg-gray-100 hover:bg-gray-300'
const SELECTED_DATE_STYLES = 'bg-primary text-white'
const DATE_NAV_STYLES = 'flex bg-white rounded px-2'
const TITLE_STYLES = 'text-sm font-semibold flex-grow text-center m-auto'
const WEEK_STYLES = 'grid grid-cols-7'
const IN_MONTH_STYLES = 'text-gray-800'
const OUT_OF_MONTH_STYLES = 'text-gray-400'
const BUTTON_STYLES = 'p-1'

export const DateSelector: React.FC<DateSelectorProps> = ({
  initialDate,
  selectedDate,
  onDateSelected: handleSelectedDate,
  dateFormat = 'yyyy-MM-dd',
  useFormattedValue,
}) => {
  const [increment, setIncrement] = useState(0)

  const handleIncrementClick =
    (newIncrement: number): React.MouseEventHandler =>
    (e) => {
      e.preventDefault()
      e.stopPropagation()
      setIncrement(increment + newIncrement)
    }

  useEffect(() => {
    setIncrement(0)
  }, [selectedDate, initialDate])

  const anchorDate = selectedDate ?? initialDate
  const parsedDate = anchorDate
    ? useFormattedValue
      ? DateTime.fromFormat(anchorDate, dateFormat)
      : DateTime.fromISO(anchorDate)
    : DateTime.fromJSDate(new Date())
  const originDate = parsedDate.isValid
    ? parsedDate
    : DateTime.fromJSDate(new Date())
  const monthStart = originDate.startOf('month').plus({ months: increment })

  const handleDateClick =
    (date: string) => (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      e.preventDefault()
      if (handleSelectedDate) {
        handleSelectedDate(date)
      }
    }

  return (
    <div className="h-full w-full px-1">
      <div className="flex flex-col">
        <nav className={DATE_NAV_STYLES}>
          <button onClick={handleIncrementClick(-12)} className={BUTTON_STYLES}>
            <FontAwesomeIcon icon={faChevronDoubleLeft as IconProp} />
          </button>
          <h3 className={TITLE_STYLES}>{monthStart.toFormat('yyyy')}</h3>
          <button onClick={handleIncrementClick(12)} className={BUTTON_STYLES}>
            <FontAwesomeIcon icon={faChevronDoubleRight as IconProp} />
          </button>
        </nav>
        <nav className={concatStyles([DATE_NAV_STYLES, 'mb-2'])}>
          <button onClick={handleIncrementClick(-1)} className={BUTTON_STYLES}>
            <FontAwesomeIcon icon={faChevronLeft as IconProp} />
          </button>
          <h3 className={TITLE_STYLES}>{monthStart.toFormat('MMM')}</h3>
          <button onClick={handleIncrementClick(1)} className={BUTTON_STYLES}>
            <FontAwesomeIcon icon={faChevronRight as IconProp} />
          </button>
        </nav>
        {new Array(6).fill('').map((_, weeks) => {
          const start = DateTime.fromISO(monthStart.toISODate())
            .plus({ weeks })
            .startOf('week')
          return (
            <ul className={WEEK_STYLES} key={`minical-week-${weeks}`}>
              {new Array(7).fill('').map((_, days) => {
                const day = DateTime.fromISO(start.toISODate()).plus({ days })
                const inMonth = monthStart.month === day.month
                const selected = day.diff(originDate, 'day').days === 0
                return (
                  <li
                    className={concatStyles([
                      DATE_STYLES,
                      selected ? SELECTED_DATE_STYLES : DESELECTED_DATE_STYLES,
                      inMonth ? IN_MONTH_STYLES : OUT_OF_MONTH_STYLES,
                    ])}
                    key={`${weeks}-${days}`}
                  >
                    <button
                      className={concatStyles([
                        'flex flex-grow p-1',
                        selected ? 'text-white' : null,
                      ])}
                      onClick={handleDateClick(day.toFormat(dateFormat))}
                    >
                      <span className="m-auto">{day.toFormat('d')}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )
        })}
      </div>
    </div>
  )
}

DateSelector.displayName = 'Form.DateSelector'
