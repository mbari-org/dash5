import React, { useCallback } from 'react'
import clsx from 'clsx'
import { SelectField } from '../../Fields'
import { Input } from '../../Fields/Input'
import { TextArea } from '../../Fields/TextArea'
import { DateField } from '../../Fields/DateField'
import {
  CommType,
  CommTypeOption,
  ScheduleMethod,
  ScheduleOption,
} from './ScheduleStep'
import { useScheduleContext } from './hooks/useSchedule'

export interface ConfirmAndSendStepProps {
  vehicleName: string
  vehicleList: string[]
  commandText: string
  waypointCount?: number
  overrideCount?: number
  previewText?: string
  previewSbdCount?: number
  alternativeAddresses?: string[]
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

export const ConfirmAndSendStep: React.FC<ConfirmAndSendStepProps> = ({
  vehicleName,
  vehicleList,
  commandText,
  waypointCount,
  overrideCount,
  previewText,
  previewSbdCount,
  alternativeAddresses = [],
}) => {
  const {
    state: {
      confirmedVehicle,
      scheduleMethod,
      customScheduleId,
      notes,
      specifiedTime,
      commType,
      timeout,
      showAlternateAddress,
      alternateAddress,
    },
    actions: {
      setConfirmedVehicle,
      setScheduleMethod,
      setCustomScheduleId,
      setNotes,
      setSpecifiedTime,
      setCommType,
      setTimeout,
      setShowAlternateAddress,
      setAlternateAddress,
    },
  } = useScheduleContext()

  const isYesVehicle =
    confirmedVehicle === null || confirmedVehicle === vehicleName
  const displayVehicle = isYesVehicle
    ? vehicleName
    : confirmedVehicle ?? vehicleName

  const vehicleOptions = vehicleList.map((name) => ({ id: name, name }))

  const handleSelectDifferentVehicle = (id: string | null) => {
    setConfirmedVehicle(id ?? vehicleName)
  }

  const handleTimeoutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTimeout(e.target.value ? parseInt(e.target.value, 10) : undefined)
  }

  const handleScheduleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomScheduleId(e.target.value)
  }

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value)
  }

  const handleDateChange = useCallback(
    (value: string) => {
      setSpecifiedTime(value)
    },
    [setSpecifiedTime]
  )

  const customizationsCount = (waypointCount ?? 0) + (overrideCount ?? 0)
  const hasBothCustomizations =
    (waypointCount ?? 0) > 0 && (overrideCount ?? 0) > 0
  const overrideSummary = customizationsCount
    ? `with ${(waypointCount ?? 0) > 0 ? `${waypointCount} waypoint(s)` : ''} ${
        hasBothCustomizations ? 'and' : ''
      } ${(overrideCount ?? 0) > 0 ? `${overrideCount} override(s)` : ''}`
    : ''

  return (
    <article className="flex h-full min-h-0 gap-6 px-4">
      {/* Left column: vehicle + schedule config */}
      <div className="flex w-1/2 flex-col gap-4 overflow-y-auto pr-2">
        {/* Vehicle confirmation */}
        <section>
          <p className="mb-2 text-sm font-medium">Send to vehicle</p>
          <ul className="flex flex-col gap-2">
            <li className="flex items-center">
              <input
                type="radio"
                id="vehicle-yes"
                name="confirmedVehicle"
                className="mr-2 h-4 w-4 checked:accent-teal-500"
                checked={isYesVehicle}
                onChange={() => setConfirmedVehicle(vehicleName)}
              />
              <label htmlFor="vehicle-yes">
                Yes, send to{' '}
                <span className="text-teal-500">{vehicleName}</span>
              </label>
            </li>
            <li className="flex items-center gap-2">
              <input
                type="radio"
                id="vehicle-no"
                name="confirmedVehicle"
                className="mr-2 h-4 w-4 checked:accent-teal-500"
                checked={!isYesVehicle}
                onChange={() => setConfirmedVehicle(null)}
              />
              <label htmlFor="vehicle-no">No, send to:</label>
              <SelectField
                name="vehicle list"
                className="w-40"
                options={vehicleOptions}
                placeholder="Select LRAUV"
                value={isYesVehicle ? undefined : confirmedVehicle ?? undefined}
                onSelect={handleSelectDifferentVehicle}
                required={!isYesVehicle}
                disabled={isYesVehicle}
              />
            </li>
          </ul>
        </section>

        {/* Communication */}
        <section>
          <p className="mb-2 text-sm font-medium">Communication</p>
          <ul className="flex flex-col gap-1">
            {COMM_TYPE_OPTIONS.map(({ value, label }) => (
              <li key={value} className="flex items-center">
                <label
                  className="flex cursor-pointer items-center py-0.5"
                  onClick={() => setCommType(value as CommType)}
                >
                  <input
                    type="radio"
                    value={value}
                    name="commType"
                    checked={commType === value}
                    className="mr-2"
                    readOnly
                  />
                  {label}
                </label>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex items-center">
            <label
              htmlFor="timeout"
              className={clsx(
                'mr-2 text-sm',
                commType === 'sat' && 'opacity-40'
              )}
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
              className={clsx(
                'ml-2 text-sm',
                commType === 'sat' && 'opacity-40'
              )}
            >
              mins
            </span>
          </div>
        </section>

        {/* Timing */}
        <section>
          <p className="mb-2 text-sm font-medium">When</p>
          <ul className="flex flex-col gap-1">
            {SCHEDULE_OPTIONS.map(({ value, label }) => (
              <li key={value} className="flex items-center">
                <label
                  className="flex cursor-pointer items-center py-0.5"
                  onClick={() => setScheduleMethod(value as ScheduleMethod)}
                >
                  <input
                    type="radio"
                    value={value}
                    name="scheduleMethod"
                    checked={scheduleMethod === value}
                    className="mr-2"
                    readOnly
                  />
                  {label}
                </label>
              </li>
            ))}
            {scheduleMethod === 'time' && (
              <li className="ml-4 mt-1">
                <DateField
                  onChange={handleDateChange}
                  value={specifiedTime ?? ''}
                  name="specifiedTime"
                  className="w-64"
                />
              </li>
            )}
          </ul>
        </section>

        {/* Notes */}
        <section>
          <label className="mb-1 block text-sm font-medium">
            Notes (will appear in log)
          </label>
          <TextArea
            name="notes"
            className="h-20 w-full"
            onChange={handleNotesChange}
            value={notes ?? ''}
          />
        </section>

        {/* Custom schedule ID */}
        <section className="flex items-center">
          <label className="mr-3 text-sm">Custom schedule id (optional):</label>
          <Input
            name="customScheduleId"
            className="max-w-xs"
            onChange={handleScheduleIdChange}
            value={customScheduleId ?? ''}
          />
        </section>

        {/* Alternate address */}
        {alternativeAddresses.length > 0 && (
          <section>
            {!showAlternateAddress ? (
              <button
                type="button"
                className="text-sm text-teal-600 underline hover:text-teal-800"
                onClick={() => setShowAlternateAddress(true)}
              >
                Send to alternate address
              </button>
            ) : (
              <>
                <p className="mb-2 text-sm font-medium">Alternate address</p>
                <ul className="flex flex-col gap-1">
                  {alternativeAddresses.map((address) => (
                    <li key={address} className="flex items-center">
                      <label
                        className="flex cursor-pointer items-center py-0.5"
                        onClick={() => setAlternateAddress(address)}
                      >
                        <input
                          type="radio"
                          value={address}
                          name="alternateAddress"
                          checked={alternateAddress === address}
                          className="mr-2"
                          readOnly
                        />
                        {address}
                      </label>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="mt-2 text-sm text-stone-500 underline hover:text-stone-700"
                  onClick={() => {
                    setShowAlternateAddress(false)
                    setAlternateAddress(null)
                  }}
                >
                  Cancel alternate address
                </button>
              </>
            )}
          </section>
        )}
      </div>

      {/* Right column: command preview */}
      <div className="flex w-1/2 flex-col">
        <p className="mb-2 flex items-baseline justify-between gap-4">
          <span>
            Schedule <span className="text-teal-500">{commandText}</span>
            {overrideSummary ? ` ${overrideSummary}` : ''} for{' '}
            <span className="text-teal-500">{displayVehicle}</span>:
          </span>
          {previewSbdCount != null && previewSbdCount >= 2 && (
            <span className="shrink-0 text-sm text-stone-500">
              (This will be sent as {previewSbdCount} SBD chunks)
            </span>
          )}
        </p>
        {previewText != null ? (
          <pre className="min-h-0 flex-1 overflow-auto rounded-lg bg-stone-100 p-4 font-mono text-sm">
            {previewText.split(';').join(';\n')}
          </pre>
        ) : (
          <p className="italic text-stone-400">Loading preview…</p>
        )}
        {notes && (
          <>
            <p className="my-2 text-sm">Additional notes:</p>
            <pre className="rounded-lg bg-stone-100 p-4 font-mono text-sm">
              {notes}
            </pre>
          </>
        )}
      </div>
    </article>
  )
}
