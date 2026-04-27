import React, { useRef } from 'react'
import clsx from 'clsx'
import { useOnClickOutside } from '@mbari/utils'

type Option = { id: string; label: string | JSX.Element }

export interface LogFiltersDropdownProps {
  className?: string
  style?: React.CSSProperties
  options: Option[]
  selectedIds: string[]
  onChange: (nextIds: string[]) => void
  searchValue: string
  onSearchChange: (value: string) => void
  onDismiss?: () => void
  placeholder?: string
  includeDataEvents?: boolean
  onIncludeDataEventsChange?: (next: boolean) => void
}

const styles = {
  container:
    'rounded-md bg-white font-display flex border border-stone-300 overflow-hidden relative mt-2 w-80 max-h-96 drop-shadow-lg',
  cellPadding: 'py-1.5 pl-4 pr-3',
  sticky: 'sticky top-0 bg-white/90 z-10',
  rowBtn: 'flex w-full items-center text-left hover:bg-stone-100',
  checkbox: 'h-4 w-4 rounded border-stone-300 text-indigo-600 mr-3',
  searchInput:
    'w-full rounded-md border border-stone-300 px-3 py-2 outline-none focus:ring focus:ring-indigo-600',
}

export const LogFiltersDropdown: React.FC<LogFiltersDropdownProps> = ({
  className,
  style,
  options,
  selectedIds,
  onChange,
  searchValue,
  onSearchChange,
  onDismiss = () => undefined,
  placeholder = 'Search',
  includeDataEvents = false,
  onIncludeDataEventsChange,
}) => {
  const ref = useRef<HTMLElement | null>(null)
  useOnClickOutside(ref, onDismiss)

  const baseIds = options.map((o) => o.id)
  const allChecked =
    baseIds.length > 0 && baseIds.every((id) => selectedIds.includes(id))

  const handleAllClick = (checked: boolean) => {
    const next = checked ? baseIds : []
    onChange(next)
  }

  const handleToggleAll = () => handleAllClick(!allChecked)

  const handleToggleOne = (id: string) => {
    const isOn = selectedIds.includes(id)
    const next = isOn
      ? selectedIds.filter((x) => x !== id)
      : [...selectedIds, id]
    onChange(next)
  }

  return (
    <article
      style={style}
      className={clsx(styles.container, className)}
      ref={ref}
    >
      <ul className={clsx('w-full overflow-y-scroll rounded-md')}>
        <li className={clsx(styles.cellPadding, styles.sticky)}>
          <input
            className={styles.searchInput}
            placeholder={placeholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="search"
          />
        </li>
        <li>
          <hr />
        </li>

        {onIncludeDataEventsChange ? (
          <>
            <li>
              <label
                className={clsx(
                  styles.rowBtn,
                  styles.cellPadding,
                  'cursor-pointer'
                )}
                htmlFor="logfilters-include-data-events"
              >
                <input
                  id="logfilters-include-data-events"
                  type="checkbox"
                  checked={includeDataEvents}
                  onChange={(e) => onIncludeDataEventsChange(e.target.checked)}
                  className={styles.checkbox}
                />
                <span className="w-full">Include Data Events</span>
              </label>
            </li>
            <li>
              <hr />
            </li>
          </>
        ) : null}

        {/* All checkbox */}
        <li>
          <button
            className={clsx(styles.rowBtn, styles.cellPadding)}
            onClick={handleToggleAll}
            aria-label="select-all"
          >
            <input
              type="checkbox"
              checked={allChecked}
              onChange={handleToggleAll}
              className={styles.checkbox}
            />
            <span className="w-full">All</span>
          </button>
        </li>

        {/* Event type options */}
        {options.map((o, index) => {
          const checked = selectedIds.includes(o.id)
          return (
            <li key={o.id ?? index}>
              <button
                className={clsx(styles.rowBtn, styles.cellPadding, 'pl-8')}
                onClick={() => handleToggleOne(o.id)}
                aria-label={`option-${o.id}`}
                data-testid={`logfilters-option-${index}`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleToggleOne(o.id)}
                  className={styles.checkbox}
                />
                <span className="w-full">{o.label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </article>
  )
}

LogFiltersDropdown.displayName = 'Components.LogFiltersDropdown'
