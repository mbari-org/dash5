import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import {
  usePlatforms,
  GetPlatformsResponse,
  getPlatformPositions,
  useTethysApiContext,
} from '@mbari/api-client'
import { createLogger } from '@mbari/utils'
import { Modal } from '@mbari/react-ui'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretRight, faCheckCircle } from '@fortawesome/free-solid-svg-icons'
import { useQueryClient, QueryClient } from 'react-query'
import { usePlatformSelectionWorkflow } from '../lib/usePlatformSelectionWorkflow'
import { PlatformSection } from './PlatformSection'
import { useMapCamera } from './MapCameraContext'

const logger = createLogger('PlatformsListModal')

const TRACKDB_POSITIONS_KEY = ['trackdb', 'platforms'] as const

type PositionFix = { lat: number; lon: number; timeMs: number }
type PositionsPayload = { positions?: PositionFix[] }

const latestFiniteFix = (
  data: PositionsPayload | undefined
): PositionFix | null => {
  const positions = data?.positions
  if (!positions?.length) return null

  let latest: PositionFix | null = null
  for (const pos of positions) {
    if (!Number.isFinite(pos.lat) || !Number.isFinite(pos.lon)) continue
    if (!latest || pos.timeMs > latest.timeMs) latest = pos
  }
  return latest
}

const latestFixQueryKey = (platformId: string) =>
  [...TRACKDB_POSITIONS_KEY, platformId, 'positions', 1] as const

// Scans all cached position queries for a platform (track + last-1) and
// returns the newest finite fix across all entries.
const cachedLatestPosition = (
  queryClient: QueryClient,
  platformId: string
): { lat: number; lon: number } | null => {
  const cached = queryClient.getQueriesData<PositionsPayload>([
    ...TRACKDB_POSITIONS_KEY,
    platformId,
    'positions',
  ])
  let latest: PositionFix | null = null
  for (const [, data] of cached) {
    const fromCache = latestFiniteFix(data)
    if (fromCache && (!latest || fromCache.timeMs > latest.timeMs)) {
      latest = fromCache
    }
  }
  return latest ? { lat: latest.lat, lon: latest.lon } : null
}

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
    unselectAll: unselectAllPlatforms,
    reset: resetPlatforms,
    apply: handleApply,
    hasChanges,
    isApplying,
  } = usePlatformSelectionWorkflow()

  const {
    data: platforms,
    isLoading: platformsLoading,
    refetch: refetchPlatforms,
  } = usePlatforms({ refresh: true })

  const { axiosInstance, siteConfig } = useTethysApiContext()
  const { setFlyToRequest } = useMapCamera()
  const queryClient = useQueryClient()
  const inflightPositions = useRef(new Map<string, Promise<PositionsPayload>>())
  // Bumped on Refresh/reset so stale in-flight fetches don't repopulate cache.
  const refreshGen = useRef(0)
  const isMounted = useRef(true)
  // Kept in sync with workingSelection so async callbacks see current selection.
  const workingSelectionRef = useRef(workingSelection)
  useEffect(() => {
    workingSelectionRef.current = workingSelection
  }, [workingSelection])
  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])
  const [noPositionIds, setNoPositionIds] = useState<Set<string>>(new Set())

  // When PlatformPath fills the track cache, re-enable any platforms that now
  // have a valid position. Filtered to TrackDB position updates only to avoid
  // churn from unrelated app polls (depth, events, vehicles, etc.).
  useEffect(() => {
    return queryClient.getQueryCache().subscribe((event) => {
      if (event?.type !== 'queryUpdated') return
      const key = event.query.queryKey as unknown[]
      if (
        key[0] !== 'trackdb' ||
        key[1] !== 'platforms' ||
        key[3] !== 'positions'
      )
        return
      setNoPositionIds((prev) => {
        if (!prev.size) return prev
        const toRemove = Array.from(prev).filter((id) =>
          cachedLatestPosition(queryClient, id)
        )
        if (!toRemove.length) return prev
        const next = new Set(prev)
        toRemove.forEach((id) => next.delete(id))
        return next
      })
    })
  }, [queryClient])

  // Shared reset for position fetch state — used by Refresh, Unselect All, Reset.
  const clearPositionFetchState = useCallback(() => {
    setNoPositionIds(new Set())
    refreshGen.current += 1
    inflightPositions.current.clear()
  }, [])

  const handleUnselectAll = useCallback(() => {
    unselectAllPlatforms()
    clearPositionFetchState()
  }, [clearPositionFetchState, unselectAllPlatforms])

  const handleReset = useCallback(() => {
    resetPlatforms()
    clearPositionFetchState()
  }, [clearPositionFetchState, resetPlatforms])

  const fetchLatestPosition = useCallback(
    (platformId: string) => {
      const pending = inflightPositions.current.get(platformId)
      if (pending) return pending

      const odss2dashApi = siteConfig?.appConfig?.odss2dashApi
      if (!odss2dashApi) {
        return Promise.reject(new Error('odss2dashApi is not configured'))
      }

      // lastNumberOfFixes: 1 with no date window — latest fix regardless of
      // age, without scanning a long time range on every click.
      const gen = refreshGen.current
      const request = getPlatformPositions(
        {
          platformId,
          lastNumberOfFixes: 1,
        },
        { instance: axiosInstance, baseURL: odss2dashApi }
      )
        .then((data) => {
          // Skip if Refresh fired after this fetch started.
          if (refreshGen.current === gen) {
            queryClient.setQueryData(latestFixQueryKey(platformId), data)
          }
          return data
        })
        .finally(() => {
          inflightPositions.current.delete(platformId)
        })

      inflightPositions.current.set(platformId, request)
      return request
    },
    [axiosInstance, queryClient, siteConfig]
  )

  const handleTogglePlatform = useCallback(
    (platformId: string) => {
      const isCurrentlySelected = workingSelection.includes(platformId)
      togglePlatformSelection(platformId)
      if (!isCurrentlySelected) {
        // If a valid position is already in cache (track or last-1), no need
        // to fetch — just ensure the button isn't stale-disabled.
        if (cachedLatestPosition(queryClient, platformId)) {
          setNoPositionIds((prev) => {
            const next = new Set(prev)
            next.delete(platformId)
            return next
          })
          return
        }
        // Fetch the latest position and disable the button if none available.
        const gen = refreshGen.current
        void fetchLatestPosition(platformId)
          .then((data) => {
            // Ignore if Refresh or Unselect All fired after this toggle.
            if (refreshGen.current !== gen) return
            if (!isMounted.current) return
            // Skip if platform was deselected while fetch was in-flight.
            if (!workingSelectionRef.current.includes(platformId)) return
            if (latestFiniteFix(data)) {
              // Valid position from the fetch — clear any stale no-position flag.
              setNoPositionIds((prev) => {
                const next = new Set(prev)
                next.delete(platformId)
                return next
              })
            } else if (!cachedLatestPosition(queryClient, platformId)) {
              // No position in cache — disable the button.
              setNoPositionIds(
                (prev) => new Set(Array.from(prev).concat(platformId))
              )
            }
          })
          .catch((err: unknown) => {
            // Network error — don't disable; user can retry.
            logger.warn(
              `Failed to fetch position on toggle for ${platformId}`,
              err
            )
          })
      } else {
        // Toggling off — clear no-position state.
        setNoPositionIds((prev) => {
          const next = new Set(prev)
          next.delete(platformId)
          return next
        })
      }
    },
    [
      fetchLatestPosition,
      queryClient,
      togglePlatformSelection,
      workingSelection,
    ]
  )

  const handleCenterOnPlatform = useCallback(
    async (platformId: string) => {
      // 1. Use any cached position (track or last-1) — fly immediately.
      const cached = cachedLatestPosition(queryClient, platformId)
      if (cached) {
        setFlyToRequest(cached)
        return
      }
      // Await any in-flight prefetch so a click during toggle-on still flies.
      const inflight = inflightPositions.current.get(platformId)
      if (inflight) {
        const gen = refreshGen.current
        try {
          const data = await inflight
          if (refreshGen.current !== gen || !isMounted.current) return
          if (!workingSelectionRef.current.includes(platformId)) return
          const latest = latestFiniteFix(data)
          if (latest) {
            setFlyToRequest({ lat: latest.lat, lon: latest.lon })
          } else if (!cachedLatestPosition(queryClient, platformId)) {
            setNoPositionIds(
              (prev) => new Set(Array.from(prev).concat(platformId))
            )
          }
        } catch {
          // Fetch error already handled by the initiating call — don't double-warn.
        }
        return
      }
      // 2. If the last-1 cache entry exists but has no finite position, disable
      //    the button and bail — no need to re-fetch.
      const cachedLastOne = queryClient.getQueryData<PositionsPayload>(
        latestFixQueryKey(platformId)
      )
      if (cachedLastOne !== undefined) {
        setNoPositionIds((prev) => new Set(Array.from(prev).concat(platformId)))
        return
      }

      if (!siteConfig?.appConfig?.odss2dashApi) {
        logger.warn(
          `Cannot fetch position for ${platformId}: odss2dashApi is not configured`
        )
        return
      }
      const gen = refreshGen.current
      try {
        const data = await fetchLatestPosition(platformId)
        // Ignore if Refresh fired, modal unmounted, or platform was deselected
        // while this fetch was in-flight.
        if (refreshGen.current !== gen || !isMounted.current) return
        if (!workingSelectionRef.current.includes(platformId)) return
        const latest = latestFiniteFix(data)
        if (latest) {
          setFlyToRequest({ lat: latest.lat, lon: latest.lon })
        } else {
          setNoPositionIds(
            (prev) => new Set(Array.from(prev).concat(platformId))
          )
        }
      } catch (err) {
        logger.warn(`Failed to fetch position for platform ${platformId}:`, err)
      }
    },
    [fetchLatestPosition, queryClient, setFlyToRequest, siteConfig]
  )

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
    clearPositionFetchState()
    // Drop last-1 entries (key[4] === 1) only; track caches (key[4] === 20)
    // stay so the map doesn't blink while the list refreshes.
    queryClient.removeQueries({
      predicate: (query) => {
        const key = query.queryKey as unknown[]
        return (
          key[0] === 'trackdb' &&
          key[1] === 'platforms' &&
          key[3] === 'positions' &&
          key[4] === 1
        )
      },
    })
  }, [clearPositionFetchState, queryClient, refetchPlatforms])

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
                      onToggleSelect={handleTogglePlatform}
                      expanded={expandedGroups.has(groupName)}
                      onToggleExpand={() => toggleGroupExpanded(groupName)}
                      filterText={filterText}
                      onlySelected={onlySelected}
                      onCenterClick={handleCenterOnPlatform}
                      noPositionIds={noPositionIds}
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
