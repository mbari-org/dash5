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
  label: React.ReactNode
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

const SCHEDULE_REPEAT_MIN = 2
const SCHEDULE_REPEAT_MAX = 30

const isScheduleRepeatDays = (n: number) =>
  Number.isInteger(n) && n >= SCHEDULE_REPEAT_MIN && n <= SCHEDULE_REPEAT_MAX

export const scheduleRepeatToSend = (
  scheduleMethod: ScheduleMethod,
  repeatEnabled: boolean,
  repeatDays: number
): number | undefined => {
  if (scheduleMethod !== 'time' || !repeatEnabled) return undefined
  return isScheduleRepeatDays(repeatDays) ? repeatDays : undefined
}

const COMM_TYPE_OPTIONS: CommTypeOption[] = [
  {
    value: 'cellsat',
    label: (
      <span>
        Attempt via cell until timeout,
        <br />
        then send via sat
      </span>
    ),
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
      repeatEnabled,
      repeatDays,
    },
    actions: {
      setScheduleMethod,
      setCustomScheduleId,
      setNotes,
      setSpecifiedTime,
      setCommType,
      setTimeout,
      setRepeatEnabled,
      setRepeatDays,
    },
  } = useScheduleContext()

  const handleScheduleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomScheduleId(e.target.value)
  }

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value)
  }

  const handleTimeoutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
      ? Math.max(1, parseInt(e.target.value, 10))
      : undefined
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

  const handleRepeatDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? Number(e.target.value) : SCHEDULE_REPEAT_MIN
    setRepeatDays(value)
  }

  const repeatHint = !repeatEnabled ? null : isScheduleRepeatDays(
      repeatDays
    ) ? (
    <>
      {'Runs once daily on this date/time then repeats ('}
      <span className="font-medium text-teal-600">
        {`+${repeatDays - 1} ${repeatDays - 1 === 1 ? 'day' : 'days'}`}
      </span>
      {')'}
      <br />
      {'(Max 30 days)'}
    </>
  ) : (
    `Enter a whole number from ${SCHEDULE_REPEAT_MIN} to ${SCHEDULE_REPEAT_MAX}.`
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
        <ul className="ml-4 w-[400px] flex-none flex-col">
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
                {value === 'time' && (
                  <span className="ml-1 text-sm italic text-teal-500">
                    (repeat option)
                  </span>
                )}
              </label>
            </li>
          ))}
          <li
            className={clsx(
              'ml-4',
              scheduleMethod === 'time' ? 'visible' : 'invisible'
            )}
          >
            {scheduleMethod === 'time' && (
              <>
                <div className="flex flex-col gap-y-2">
                  <DateField
                    onChange={handleDateChange}
                    value={specifiedTime ?? ''}
                    name="specifiedTime"
                    className="w-64"
                  />
                  <div className="flex flex-wrap items-center gap-x-3">
                    <div className="flex items-center">
                      <div
                        className={clsx(
                          'flex items-center',
                          !specifiedTime && 'opacity-40'
                        )}
                      >
                        <label
                          htmlFor="scheduleRepeat"
                          className="flex items-center py-1"
                        >
                          <input
                            id="scheduleRepeat"
                            type="checkbox"
                            name="scheduleRepeat"
                            checked={repeatEnabled}
                            disabled={!specifiedTime}
                            className="mr-2 h-4 w-4"
                            onChange={(e) => setRepeatEnabled(e.target.checked)}
                          />
                          Repeat
                        </label>
                      </div>
                      {!specifiedTime && (
                        <span className="ml-2 text-sm italic text-teal-500">
                          (enter a time first)
                        </span>
                      )}
                    </div>
                    <div className="w-16 shrink-0">
                      {repeatEnabled && (
                        <Input
                          name="repeatDays"
                          type="number"
                          min={SCHEDULE_REPEAT_MIN}
                          max={SCHEDULE_REPEAT_MAX}
                          className="h-fit"
                          value={
                            Number.isFinite(repeatDays)
                              ? String(repeatDays)
                              : ''
                          }
                          onChange={handleRepeatDaysChange}
                          aria-label="Repeat days"
                        />
                      )}
                    </div>
                    {repeatEnabled && <span>days</span>}
                  </div>
                </div>
                {repeatEnabled && (
                  <p className="mt-1 text-sm opacity-70">{repeatHint}</p>
                )}
              </>
            )}
          </li>
        </ul>
        <ul className="w-[300px] flex-none flex-col">
          {COMM_TYPE_OPTIONS.map(({ value, label }) => (
            <li className="mr-4 flex items-start" key={value}>
              <label
                htmlFor="commType"
                className="flex items-start py-1"
                onClick={() => setCommType(value)}
              >
                <input
                  type="radio"
                  value={value}
                  name="commType"
                  checked={commType === value}
                  className="mr-2 mt-1 shrink-0"
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
            min={1}
            disabled={commType === 'sat'}
            className="h-fit w-16"
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
