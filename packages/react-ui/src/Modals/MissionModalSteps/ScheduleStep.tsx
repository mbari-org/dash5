import { TextArea } from '../../Fields/TextArea'
import { Input } from '../../Fields/Input'
import React, { useCallback } from 'react'
import { useScheduleContext } from './hooks/useSchedule'
import clsx from 'clsx'
import { DateField } from '../../Fields/DateField'

export type ScheduleMethod = 'ASAP' | 'end' | 'time'
export type CommType = 'cellsat' | 'cell' | 'sat'

export interface ScheduleOption {
  value: ScheduleMethod
  label: string
}

export interface CommTypeOption {
  value: CommType
  label: string
}

export interface ScheduleProps {
  vehicleName: string
  commandText: string
  commandDescriptor?: string
  waypointCount?: number
  overrideCount?: number
}

const SCHEDULE_OPTIONS: ScheduleOption[] = [
  { value: 'ASAP', label: 'ASAP' },
  { value: 'end', label: 'At the end of the current schedule' },
  { value: 'time', label: 'For specific time:' },
]

const COMM_TYPE_OPTIONS: CommTypeOption[] = [
  {
    value: 'cellsat',
    label: 'Attempt via cell until timeout, then send via sat',
  },
  { value: 'cell', label: 'Attempt via cell until timeout' },
  { value: 'sat', label: 'Send via sat' },
]

export const ScheduleStep: React.FC<ScheduleProps> = ({
  vehicleName,
  commandText,
  commandDescriptor = 'mission',
  waypointCount,
  overrideCount,
}) => {
  const {
    state: {
      scheduleMethod,
      customScheduleId,
      notes,
      specifiedTime,
      commType,
      timeout,
    },
    actions: {
      setScheduleMethod,
      setCustomScheduleId,
      setNotes,
      setSpecifiedTime,
      setCommType,
      setTimeout,
    },
  } = useScheduleContext()

  const handleScheduleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomScheduleId(e.target.value)
  }

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value)
  }

  const handleTimeoutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? parseInt(e.target.value, 10) : undefined
    setTimeout(value)
  }

  const customizationsCount = (waypointCount ?? 0) + (overrideCount ?? 0)
  const hasBothCustomizations = waypointCount !== overrideCount
  const overrideSummary = customizationsCount
    ? `with ${(waypointCount ?? 0) > 0 ? `${waypointCount} waypoint(s)` : ''} ${
        hasBothCustomizations ? 'and' : ''
      } ${(overrideCount ?? 0) > 0 ? `${overrideCount} override(s)` : ''}`
    : ''

  const handleDateChange = useCallback(
    (value: string) => {
      setSpecifiedTime(value)
    },
    [setSpecifiedTime]
  )

  return (
    <article className="h-full">
      <section className="mx-4 mb-4">
        Schedule{' '}
        <span className="text-teal-500" data-testid="mission name">
          {commandText}
        </span>{' '}
        {commandDescriptor} for{' '}
        <span className="text-teal-500" data-testid="mission name">
          {vehicleName}
        </span>{' '}
        {overrideSummary}
      </section>
      <section className="flex">
        <ul className="ml-4 flex max-h-full flex-col">
          {SCHEDULE_OPTIONS.map(({ value, label }) => (
            <li className="mr-4 flex items-center" key={value}>
              <label
                htmlFor="scheduleMethod"
                className="flex items-center py-1"
                onClick={() => setScheduleMethod(value)}
              >
                <input
                  type="radio"
                  value={value}
                  name="scheduleMethod"
                  checked={scheduleMethod === value}
                  className="mr-2"
                />
                {label}
              </label>
            </li>
          ))}
          <li
            className={clsx(
              'ml-4 flex items-center',
              scheduleMethod === 'time' ? 'visible' : 'invisible'
            )}
          >
            {scheduleMethod === 'time' && (
              <DateField
                onChange={handleDateChange}
                value={specifiedTime ?? ''}
                name="specifiedTime"
                className="w-64"
              />
            )}
          </li>
        </ul>
        <ul className="flex max-h-full flex-col">
          {COMM_TYPE_OPTIONS.map(({ value, label }) => (
            <li className="mr-4 flex items-center" key={value}>
              <label
                htmlFor="commType"
                className="flex items-center py-1"
                onClick={() => setCommType(value)}
              >
                <input
                  type="radio"
                  value={value}
                  name="commType"
                  checked={commType === value}
                  className="mr-2"
                />
                {label}
              </label>
            </li>
          ))}
        </ul>
        <div className="ml-2 flex">
          <label
            htmlFor="timeout"
            className={clsx('mr-2 pt-1', commType === 'sat' && 'opacity-40')}
          >
            Cell timeout:
          </label>
          <Input
            name="timeout"
            type="number"
            disabled={commType === 'sat'}
            className="h-fit w-20"
            value={timeout?.toString() ?? '5'}
            onChange={handleTimeoutChange}
          />
          <span
            className={clsx('ml-2 pt-1', commType === 'sat' && 'opacity-40')}
          >
            mins
          </span>
        </div>
      </section>
      <section className="mx-4 mt-4 flex items-center">
        <label>Custom schedule id (optional):</label>
        <Input
          name="customScheduleId"
          className="ml-4 max-w-xs"
          onChange={handleScheduleIdChange}
          value={customScheduleId ?? ''}
        />
      </section>
      <section className="mx-4 mt-4 flex flex-col">
        <label>Notes (will appear in log)</label>
        <TextArea
          name="notes"
          className="h-28 w-full"
          onChange={handleNotesChange}
          value={notes ?? ''}
        />
      </section>
    </article>
  )
}
