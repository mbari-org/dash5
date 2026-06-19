import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { SelectOptionGroup } from './Select'

export interface MissionCascaderProps {
  groups: SelectOptionGroup[]
  /** Currently selected option id (cumulative encoded value string) */
  value?: string
  placeholder?: string
  onSelect: (id: string | null) => void
  clearable?: boolean
}

const groupPriority = (label: string) => {
  if (label === 'Standard Ops') return 0
  if (label.toLowerCase().startsWith('deprecated') || label.startsWith('_'))
    return 2
  return 1
}

const sortedGroups = (groups: SelectOptionGroup[]) =>
  [...groups].sort((a, b) => {
    const pa = groupPriority(a.label)
    const pb = groupPriority(b.label)
    if (pa !== pb) return pa - pb
    return a.label.localeCompare(b.label)
  })

export const MissionCascader: React.FC<MissionCascaderProps> = ({
  groups,
  value,
  placeholder = 'Select mission',
  onSelect,
  clearable,
}) => {
  const sorted = sortedGroups(groups)
  const allOptions = sorted.flatMap((g) => g.options)
  const selectedOption = allOptions.find((o) => o.id === value)
  const selectedGroup = selectedOption
    ? sorted.find((g) => g.options.some((o) => o.id === value))
    : null

  const [isOpen, setIsOpen] = useState(false)
  const [expandedFolder, setExpandedFolder] = useState<string | null>(
    selectedGroup?.label ?? null
  )
  const [search, setSearch] = useState('')
  const [dropdownPos, setDropdownPos] = useState<{
    top: number
    left: number
    width: number
  } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const open = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setDropdownPos({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      })
    }
    setIsOpen(true)
    setExpandedFolder(null) // all folders start closed
    setSearch('')
    setTimeout(() => searchRef.current?.focus(), 50)
  }

  const close = () => {
    setIsOpen(false)
    setSearch('')
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      const inTrigger = containerRef.current?.contains(target)
      const inDropdown = dropdownRef.current?.contains(target)
      if (!inTrigger && !inDropdown) {
        close()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const searchResults =
    search.trim().length > 0
      ? sorted.flatMap((g) =>
          g.options
            .filter((o) =>
              `${g.label} ${o.name}`
                .toLowerCase()
                .includes(search.toLowerCase())
            )
            .map((o) => ({ folder: g.label, option: o }))
        )
      : []

  const handleSelect = (id: string) => {
    onSelect(id)
    close()
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger */}
      <div
        className="client__multi__select_container w-full cursor-pointer"
        onClick={() => (isOpen ? close() : open())}
      >
        <div className="client__multi__select__control flex min-h-[38px] items-center justify-between rounded border border-gray-300 bg-white px-2">
          <span
            className={
              selectedOption ? 'text-sm text-gray-800' : 'text-sm text-gray-400'
            }
          >
            {selectedOption
              ? `${selectedGroup?.label ? selectedGroup.label + ' / ' : ''}${
                  selectedOption.name
                }`
              : placeholder}
          </span>
          <div className="flex items-center gap-1.5">
            {clearable && selectedOption && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onSelect(null)
                }}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Clear"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 text-gray-400 transition-transform ${
                isOpen ? 'rotate-180' : ''
              }`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Dropdown — portaled to body so it escapes table stacking context */}
      {isOpen &&
        dropdownPos &&
        createPortal(
          <div
            ref={dropdownRef}
            className="fixed z-[9999] min-w-[280px] overflow-hidden rounded border border-gray-200 bg-white shadow-lg"
            style={{
              top: dropdownPos.top + 4,
              left: dropdownPos.left,
              width: Math.max(dropdownPos.width, 280),
            }}
          >
            {/* Search */}
            <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5 flex-shrink-0 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search missions…"
                className="w-full text-sm text-gray-700 outline-none placeholder:text-gray-400"
              />
            </div>

            <div className="max-h-72 overflow-y-auto">
              {search.trim() ? (
                /* Flat search results */
                searchResults.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-gray-400">
                    No missions found
                  </p>
                ) : (
                  searchResults.map(({ folder, option }) => (
                    <div
                      key={option.id}
                      className={`cursor-pointer px-4 py-1.5 text-sm ${
                        option.id === value
                          ? 'bg-blue-50 font-medium text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => handleSelect(option.id)}
                    >
                      <span className="mr-1 text-xs text-gray-400">
                        {folder}/
                      </span>
                      {option.name}
                    </div>
                  ))
                )
              ) : (
                /* Accordion folders */
                sorted.map((g) => {
                  const isExpanded = expandedFolder === g.label
                  const hasSelected = g.options.some((o) => o.id === value)
                  return (
                    <div key={g.label}>
                      {/* Folder row — blue text, light background */}
                      <div
                        className={`flex cursor-pointer items-center justify-between border-t border-gray-100 px-3 py-2 text-sm font-semibold ${
                          isExpanded
                            ? 'bg-blue-50 text-blue-700'
                            : hasSelected
                            ? 'text-blue-600 hover:bg-blue-50'
                            : 'text-blue-600 hover:bg-blue-50'
                        }`}
                        onClick={() =>
                          setExpandedFolder(isExpanded ? null : g.label)
                        }
                      >
                        <span>{g.label}</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className={`h-3.5 w-3.5 text-blue-400 transition-transform ${
                            isExpanded ? 'rotate-90' : ''
                          }`}
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>

                      {/* Files — indented, lighter weight, white background */}
                      {isExpanded &&
                        g.options.map((opt) => (
                          <div
                            key={opt.id}
                            className={`cursor-pointer border-b border-gray-50 py-1.5 pl-6 pr-3 text-sm font-normal ${
                              opt.id === value
                                ? 'bg-blue-50 font-medium text-blue-700'
                                : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                            }`}
                            onClick={() => handleSelect(opt.id)}
                          >
                            {opt.name}
                          </div>
                        ))}
                    </div>
                  )
                })
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}

MissionCascader.displayName = 'Fields.MissionCascader'
