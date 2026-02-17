import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { usePlatforms, GetPlatformsResponse } from '@mbari/api-client'
import { Modal } from '@mbari/react-ui'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretRight, faCheckCircle } from '@fortawesome/free-solid-svg-icons'
import { usePlatformSelectionWorkflow } from '../lib/usePlatformSelectionWorkflow'
import { PlatformSection } from './PlatformSection'

export interface PlatformsListModalProps {
  onClose: () => void
}

const PLATFORM_MODAL_POSITION = { top: 120, left: 70 }

export const PlatformsListModal: React.FC<PlatformsListModalProps> = ({
  onClose,
}) => {
  const {
    workingSelection,
    togglePlatformSelection,
    unselectAll: handleUnselectAll,
    reset: handleReset,
    apply: handleApply,
    hasChanges,
    isApplying,
  } = usePlatformSelectionWorkflow()

  const {
    data: platforms,
    isLoading: platformsLoading,
    refetch: refetchPlatforms,
  } = usePlatforms({ refresh: true })

  const [filterText, setFilterText] = useState('')
  const [onlySelected, setOnlySelected] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  const groups = useMemo(() => {
    return (
      platforms?.reduce(
        (
          acc: Record<string, GetPlatformsResponse[]>,
          p: GetPlatformsResponse
        ) => {
          const group = acc[p.typeName] ?? []
          group.push(p)
          return { ...acc, [p.typeName]: group }
        },
        {} as Record<string, GetPlatformsResponse[]>
      ) ?? {}
    )
  }, [platforms])

  const selectedGroupNames = useMemo(() => {
    const groupNames = Object.keys(groups)
    if (groupNames.length === 0) return []
    return groupNames.filter((groupName) =>
      (groups[groupName] ?? []).some((p) => workingSelection.includes(p._id))
    )
  }, [groups, workingSelection])

  const visibleGroupNames = useMemo(() => {
    return onlySelected ? selectedGroupNames : Object.keys(groups)
  }, [groups, onlySelected, selectedGroupNames])

  useEffect(() => {
    if (platforms) {
      setExpandedGroups(new Set(Object.keys(groups)))
    }
  }, [platforms, groups])

  useEffect(() => {
    if (!onlySelected) return
    setExpandedGroups(new Set(selectedGroupNames))
  }, [onlySelected, selectedGroupNames])

  const toggleGroupExpanded = useCallback((groupName: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(groupName)) {
        next.delete(groupName)
      } else {
        next.add(groupName)
      }
      return next
    })
  }, [])

  const handleExpandAllGroups = useCallback(() => {
    setExpandedGroups(new Set(visibleGroupNames))
  }, [visibleGroupNames])

  const handleCollapseAllGroups = useCallback(() => {
    setExpandedGroups(new Set())
  }, [])

  const anyVisibleGroupsExpanded = useMemo(() => {
    return visibleGroupNames.some((name) => expandedGroups.has(name))
  }, [expandedGroups, visibleGroupNames])

  const handleToggleAllGroups = useCallback(() => {
    if (anyVisibleGroupsExpanded) {
      handleCollapseAllGroups()
    } else {
      handleExpandAllGroups()
    }
  }, [anyVisibleGroupsExpanded, handleCollapseAllGroups, handleExpandAllGroups])

  const handleRefresh = useCallback(() => {
    refetchPlatforms()
  }, [refetchPlatforms])

  const isLoading = platformsLoading || isApplying

  return (
    <Modal
      title={
        <div className="text-xl font-bold">
          Select Tracking DB assets to display
        </div>
      }
      onClose={onClose}
      draggable
      open
      style={{
        position: 'fixed',
        top: `${PLATFORM_MODAL_POSITION.top}px`,
        left: `${PLATFORM_MODAL_POSITION.left}px`,
        zIndex: 1000,
        maxHeight: '70vh',
      }}
      onConfirm={handleApply}
      confirmButtonText={
        <span className="flex items-center gap-2">
          <FontAwesomeIcon icon={faCheckCircle} />
          Apply
        </span>
      }
      disableConfirm={isLoading || !hasChanges}
      onCancel={onClose}
      cancelButtonText="Close"
      extraButtons={[
        {
          buttonText: 'Unselect all',
          appearance: 'secondary',
          onClick: handleUnselectAll,
          disabled: isLoading,
        },
        {
          buttonText: 'Reset',
          appearance: 'secondary',
          onClick: handleReset,
          disabled: isLoading,
        },
        {
          buttonText: 'Refresh',
          appearance: 'secondary',
          onClick: handleRefresh,
          disabled: isLoading,
        },
      ]}
    >
      <div className="flex flex-col">
        <div className="mb-4 flex items-center gap-6">
          <input
            type="text"
            placeholder="Filter platforms..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="flex-1 rounded border border-gray-300 py-2 pl-3 "
            disabled={isLoading}
          />
          <label className="flex items-center gap-1 ">
            <input
              type="checkbox"
              checked={onlySelected}
              onChange={(e) => setOnlySelected(e.target.checked)}
              disabled={isLoading}
              className="h-5 w-5 cursor-pointer accent-blue-600"
            />
            <span className="text-sm text-gray-500">Only display selected</span>
          </label>
        </div>

        <div className="relative mb-[10px]">
          <button
            type="button"
            onClick={handleToggleAllGroups}
            disabled={isLoading || visibleGroupNames.length === 0}
            className="absolute right-[28px] top-[18px] z-20 inline-flex h-6 w-6 items-center justify-center rounded-md bg-blue-400 p-2 text-white  hover:bg-blue-600 focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={
              anyVisibleGroupsExpanded ? 'Collapse all' : 'Expand all'
            }
            title={anyVisibleGroupsExpanded ? 'Collapse all' : 'Expand all'}
          >
            <FontAwesomeIcon
              icon={faCaretRight}
              size="lg"
              className={[
                'transition-transform duration-200 ease-in-out motion-reduce:transition-none',
                anyVisibleGroupsExpanded ? 'rotate-90' : 'rotate-0',
              ].join(' ')}
            />
          </button>

          <div
            className="custom-scrollbar flex-grow overflow-y-auto"
            style={{
              height: '300px',
              background: '#e3f2fd',
              padding: '10px',
              borderRadius: '4px',
            }}
          >
            {isLoading && platformsLoading ? (
              <div className="py-4 text-center text-gray-500">
                Loading platforms...
              </div>
            ) : (
              <div className="tree-view pr-14">
                {Object.keys(groups).length === 0 ? (
                  <div className="py-4 text-center text-sm italic text-gray-500">
                    No platforms found
                  </div>
                ) : onlySelected && workingSelection.length === 0 ? (
                  <div className="py-4 text-center text-sm italic text-gray-500">
                    No assets selected
                  </div>
                ) : onlySelected && visibleGroupNames.length === 0 ? (
                  <div className="py-4 text-center text-sm italic text-gray-500">
                    No assets selected
                  </div>
                ) : (
                  visibleGroupNames.map((groupName) => (
                    <PlatformSection
                      key={groupName}
                      name={groupName}
                      items={groups[groupName]}
                      selectedIds={workingSelection}
                      onToggleSelect={togglePlatformSelection}
                      expanded={expandedGroups.has(groupName)}
                      onToggleExpand={() => toggleGroupExpanded(groupName)}
                      filterText={filterText}
                      onlySelected={onlySelected}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <div className="-mb-4 flex w-full items-center justify-end pr-2 text-sm">
          {hasChanges ? (
            <span className="text-blue-600">Selection changed</span>
          ) : (
            <span className="w-fit text-gray-500">No changes</span>
          )}
        </div>
      </div>
    </Modal>
  )
}
