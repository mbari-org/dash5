import { TextArea } from '../../Fields/TextArea'
import { Input } from '../../Fields/Input'
import { DateField } from '../../Fields/DateField'
import React from 'react'

export type ScheduleOption = 'ASAP' | 'end' | 'time'

export interface ScheduleProps {
  vehicleName: string
  mission: string
  waypointCount?: number
  overrideCount?: number
  onNotesChanged?: (notes: string) => void
  notes?: string | null
  onScheduleMethodChanged?: (scheduleMethod: ScheduleOption) => void
  scheduleMethod?: string | null
  onScheduleIdChanged?: (scheduleId: string) => void
  scheduleId?: string | null
  specifiedTime?: string | null
  onSpecifiedTimeChanged?: (time: string | null) => void
}

export const ScheduleStep: React.FC<ScheduleProps> = ({
  vehicleName,
  mission,
  waypointCount,
  overrideCount,
  onNotesChanged,
  notes = null,
  onScheduleIdChanged,
  scheduleId = null,
  onScheduleMethodChanged,
  scheduleMethod = null,
  specifiedTime = null,
  onSpecifiedTimeChanged,
}) => {
  const handleScheduleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onScheduleIdChanged?.(e.target.value)
  }
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onNotesChanged?.(e.target.value)
  }

  return (
    <article className="h-full">
      <section className="mx-4 mb-6">
        Schedule{' '}
        <span className="text-teal-500" data-testid="mission name">
          {mission}
        </span>{' '}
        mission for{' '}
        <span className="text-teal-500" data-testid="mission name">
          {vehicleName}
        </span>{' '}
        with {waypointCount || 'no'} waypoint(s) and {overrideCount ?? 'no'}{' '}
        override(s)
      </section>
      <ul className="ml-4 -mt-1 flex max-h-full flex-col">
        {[
          { value: 'ASAP', label: 'ASAP' },
          { value: 'end', label: 'At the end of the current schedule' },
          { value: 'time', label: 'For specific time:' },
        ].map(({ value, label }) => (
          <li className="mr-4 flex" key={value}>
            <label
              htmlFor="scheduleMethod"
              className="py-1"
              onClick={() => onScheduleMethodChanged?.(value as ScheduleOption)}
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
                onChange={onSpecifiedTimeChanged}
                value={specifiedTime ?? ''}
                name="specifiedTime"
                className="ml-4 max-w-xs"
              />
            )}
          </li>
        ))}
      </ul>
      <section className="mx-4 mt-4 flex items-center">
        <label>Custom schedule id (optional):</label>
        <Input
          name="customScheduleId"
          className="ml-4 max-w-xs"
          onChange={handleScheduleChange}
          value={scheduleId ?? ''}
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
