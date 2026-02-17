import React, { useMemo, useState } from 'react'
import { Modal, Button } from '@mbari/react-ui'
import { EventKind } from '@mbari/api-client'
import { FilterRowUi, isFilteringType } from '../types'
import VehiclePickerModal from './VehiclePickerModal'

const FilteredNotificationEditModal: React.FC<{
  open: boolean
  mode: 'create' | 'edit'
  initial: FilterRowUi
  eventKinds: EventKind[]
  vehicleNames: string[]
  onClose: () => void
  onSave: (draft: FilterRowUi) => void
  onDelete?: () => void
}> = ({
  open,
  mode,
  initial,
  eventKinds,
  vehicleNames,
  onClose,
  onSave,
  onDelete,
}) => {
  const [draft, setDraft] = useState<FilterRowUi>(() => ({
    eventKindName: initial.eventKindName,
    textFilter: initial.textFilter,
    filteringType: initial.filteringType,
    vehiclesChecked: { ...initial.vehiclesChecked },
  }))
  const [pickerOpen, setPickerOpen] = useState(false)

  const validateRegex = (value: string) => {
    try {
      RegExp(value)
      return null
    } catch (e: unknown) {
      return e instanceof Error ? e.message : 'Invalid regex'
    }
  }
  const regexError =
    draft.filteringType === 'REGEX' && draft.textFilter
      ? validateRegex(draft.textFilter)
      : null
  const hasSelectedVehicles = useMemo(
    () => Object.values(draft.vehiclesChecked).some(Boolean),
    [draft.vehiclesChecked]
  )

  return (
    <Modal
      title={
        <div className="text-lg font-bold">
          {mode === 'create'
            ? 'Add filtered notification'
            : 'Edit filtered notification'}
        </div>
      }
      open={open}
      onClose={onClose}
      onConfirm={() => onSave({ ...draft })}
      confirmButtonText={mode === 'create' ? 'Add' : 'Save'}
      disableConfirm={
        Boolean(regexError) || (mode === 'create' && !hasSelectedVehicles)
      }
      cancelButtonText="Close"
      extraButtons={
        onDelete
          ? [
              {
                buttonText: 'Delete',
                appearance: 'destructive' as const,
                onClick: onDelete,
              },
            ]
          : undefined
      }
      style={{ minWidth: 720 }}
      blurBackground
    >
      <article className="flex flex-col gap-3">
        <section className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-stone-600">Event</label>
            <select
              className="rounded border px-2 py-1 text-sm"
              value={draft.eventKindName}
              onChange={(e) =>
                setDraft((d) => ({ ...d, eventKindName: e.target.value }))
              }
            >
              {eventKinds.map((ek) => (
                <option key={ek.name} value={ek.name}>
                  {ek.base}
                  {ek.subkind ? ` | ${ek.subkind}` : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-xs text-stone-600">Text filter</label>
            <input
              className={`w-full rounded border px-2 py-1 text-sm ${
                draft.filteringType === 'REGEX' &&
                draft.textFilter &&
                regexError
                  ? 'border-red-500'
                  : ''
              }`}
              placeholder="Enter text / glob / regex"
              value={draft.textFilter}
              onChange={(e) =>
                setDraft((d) => ({ ...d, textFilter: e.target.value }))
              }
            />
            {draft.filteringType === 'REGEX' &&
              draft.textFilter &&
              regexError && (
                <div className="text-xs text-red-600">{regexError}</div>
              )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-stone-600">Mode</label>
            <select
              className="rounded border px-2 py-1 text-sm"
              value={draft.filteringType}
              onChange={(e) => {
                const v = e.target.value
                if (isFilteringType(v))
                  setDraft((d) => ({ ...d, filteringType: v }))
              }}
            >
              <option value="LITERAL">Literal</option>
              <option value="GLOB">Glob</option>
              <option value="REGEX">Regex</option>
            </select>
          </div>
        </section>
        <section className="flex flex-wrap items-center gap-2">
          <Button appearance="secondary" onClick={() => setPickerOpen(true)}>
            {Object.values(draft.vehiclesChecked).some(Boolean)
              ? 'Edit vehicles'
              : 'Add vehicles'}
          </Button>
          <div className="flex-1 text-sm">
            {(() => {
              const selected = Object.entries(draft.vehiclesChecked)
                .filter(([, v]) => v)
                .map(([name]) => name)
              return (
                <span className={selected.length ? '' : 'text-stone-400'}>
                  {selected.length
                    ? selected.join(', ')
                    : 'Select at least one vehicle'}
                </span>
              )
            })()}
          </div>
        </section>
      </article>
      {pickerOpen && (
        <VehiclePickerModal
          vehicleNames={vehicleNames}
          selectedMap={draft.vehiclesChecked}
          onToggle={(name: string) =>
            setDraft((d) => ({
              ...d,
              vehiclesChecked: {
                ...d.vehiclesChecked,
                [name]: !d.vehiclesChecked[name],
              },
            }))
          }
          onSelectAll={() =>
            setDraft((d) => ({
              ...d,
              vehiclesChecked: Object.fromEntries(
                vehicleNames.map((n) => [n, true])
              ),
            }))
          }
          onClearAll={() =>
            setDraft((d) => ({
              ...d,
              vehiclesChecked: Object.fromEntries(
                vehicleNames.map((n) => [n, false])
              ),
            }))
          }
          onClose={() => setPickerOpen(false)}
        />
      )}
    </Modal>
  )
}

export default FilteredNotificationEditModal
