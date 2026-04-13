import React, { useMemo } from 'react'
import clsx from 'clsx'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowsToCircle,
  faCaretRight,
} from '@fortawesome/free-solid-svg-icons'
import Tippy from '@tippyjs/react'
import Image from 'next/image'
import { GetPlatformsResponse } from '@mbari/api-client'

export interface PlatformSectionProps {
  name: string
  items: GetPlatformsResponse[]
  selectedIds: string[]
  onToggleSelect: (platformId: string) => void
  expanded?: boolean
  onToggleExpand?: () => void
  filterText?: string
  onlySelected?: boolean
  headerRight?: React.ReactNode
  onCenterClick?: (platformId: string) => void
}

export const PlatformSection: React.FC<PlatformSectionProps> = ({
  name,
  items,
  selectedIds,
  onToggleSelect,
  expanded = false,
  onToggleExpand,
  filterText,
  onlySelected,
  headerRight,
  onCenterClick,
}) => {
  const odssApi = 'https://odss.mbari.org/odss'

  const filteredItems = useMemo(() => {
    let filtered = items

    if (onlySelected) {
      filtered = filtered.filter((item) => selectedIds.includes(item._id))
    }

    if (filterText) {
      const lowerFilter = filterText.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(lowerFilter) ||
          item.abbreviation.toLowerCase().includes(lowerFilter)
      )
    }

    return filtered
  }, [items, selectedIds, filterText, onlySelected])

  return (
    <article className="tree-item">
      <div className="flex items-center justify-between py-2 pl-2 pr-2">
        <button
          onClick={onToggleExpand}
          className="mr-1 flex items-center text-gray-700 hover:text-blue-600 focus:outline-none"
          aria-label={expanded ? 'Collapse' : 'Expand'}
        >
          <FontAwesomeIcon
            icon={faCaretRight}
            size="sm"
            className={clsx(
              'transition-transform duration-200 ease-in-out motion-reduce:transition-none',
              expanded ? 'rotate-90' : 'rotate-0'
            )}
          />
          <span className="ml-1 text-sm font-bold">{name}</span>
        </button>
        {headerRight ? (
          <div className="flex items-center">{headerRight}</div>
        ) : null}
      </div>

      <div
        className={clsx(
          'duration-800 grid transition-[grid-template-rows] ease-in-out motion-reduce:transition-none',
          expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        )}
      >
        <div
          className={clsx(
            'duration-800 origin-top transform-gpu overflow-hidden transition-[opacity,transform] motion-reduce:transition-none',
            expanded
              ? 'scale-y-100 opacity-100'
              : 'pointer-events-none scale-y-95 opacity-0'
          )}
          aria-hidden={!expanded}
        >
          <ul className="children-container relative ml-[10px] pl-[12px]">
            {filteredItems.length === 0 ? (
              <div className="py-2 pl-10 text-sm italic text-gray-500">
                No platforms found
              </div>
            ) : (
              filteredItems.map((item, idx) => (
                <li
                  key={item._id}
                  className="tree-row relative flex items-center py-2 pl-2"
                >
                  {/* vertical tree line */}
                  <span
                    aria-hidden
                    className="absolute -left-3 top-0 w-0.5 bg-stone-400"
                    style={{
                      bottom: idx === filteredItems.length - 1 ? '50%' : 0, // stop at last item
                    }}
                  />
                  {/* horizontal tree line */}
                  <div className="tree-connector-wrapper ml-4 flex items-center">
                    <span className="tree-connector -ml-9 mr-2 inline-block h-0.5 w-7 rounded bg-stone-400" />
                  </div>
                  <label className="flex w-full cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item._id)}
                      onChange={() => onToggleSelect(item._id)}
                      className="mr-2 h-5 w-5 cursor-pointer accent-blue-600"
                    />
                    {item.iconUrl && (
                      <Image
                        src={`${odssApi}/${item.iconUrl}`}
                        width={16}
                        height={16}
                        className="mr-2 h-4 w-auto"
                        alt={`${item.name} - ${item.typeName} icon`}
                        onError={(e) => {
                          ;(e.currentTarget as HTMLImageElement).style.display =
                            'none'
                        }}
                      />
                    )}
                    <span className="text-sm font-medium">
                      {item.name}{' '}
                      <span className="text-sm text-stone-400">
                        ({item.abbreviation})
                      </span>
                    </span>
                    {onCenterClick !== undefined && (
                      <Tippy
                        content={`Center map on ${item.name}`}
                        placement="top-start"
                        appendTo="parent"
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            onCenterClick(item._id)
                          }}
                          className="ml-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                          aria-label={`Center map on ${item.name}`}
                          style={{
                            width: '20px',
                            height: '20px',
                            flexShrink: 0,
                            borderRadius: '3px',
                            background: '#fff',
                            border: 0,
                            padding: 0,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.35)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                        >
                          <FontAwesomeIcon
                            icon={faArrowsToCircle}
                            style={{ color: '#6b7280', fontSize: '14.5px' }}
                          />
                        </button>
                      </Tippy>
                    )}
                  </label>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </article>
  )
}
