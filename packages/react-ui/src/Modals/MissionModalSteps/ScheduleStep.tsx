import { TextArea } from '../../Fields/TextArea'
import { Input } from '../../Fields/Input'
import { DateField } from '../../Fields/DateField'
import React from 'react'
import { useScheduleContext } from './hooks/useSchedule'

export type ScheduleMethod = 'ASAP' | 'end' | 'time'
export type CommType = 'satCell' | 'cell' | 'sat'

export interface ScheduleOption {
  value: ScheduleMethod
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

export const ScheduleStep: React.FC<ScheduleProps> = ({
  vehicleName,
  commandText,
  commandDescriptor = 'mission',
  waypointCount,
  overrideCount,
}) => {
  // Get schedule state and actions from context
  const {
    state: { scheduleMethod, customScheduleId, notes, specifiedTime },
    actions: {
      setScheduleMethod,
      setCustomScheduleId,
      setNotes,
      setSpecifiedTime,
    },
  } = useScheduleContext()

  const handleScheduleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomScheduleId(e.target.value)
  }

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value)
  }

  const customizationsCount = (waypointCount ?? 0) + (overrideCount ?? 0)
  const hasBothCustomizations = waypointCount !== overrideCount
  const overrideSummary = customizationsCount
    ? `with ${(waypointCount ?? 0) > 0 ? `${waypointCount} waypoint(s)` : ''} ${
        hasBothCustomizations ? 'and' : ''
      } ${(overrideCount ?? 0) > 0 ? `${overrideCount} override(s)` : ''}`
    : ''

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
        <ul className="ml-4  flex max-h-full flex-col">
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
              {scheduleMethod === 'time' && value === 'time' && (
                <DateField
                  onChange={setSpecifiedTime}
                  value={specifiedTime ?? ''}
                  name="specifiedTime"
                  className="ml-4 max-w-xs"
                />
              )}
            </li>
          ))}
        </ul>
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
