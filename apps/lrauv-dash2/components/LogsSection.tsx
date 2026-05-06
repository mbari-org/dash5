import React, { useMemo, useState, useCallback } from 'react'
import {
  useInfiniteEvents,
  useTethysApiContext,
  timeoutExpiredRegEx,
  GetEventsResponse,
} from '@mbari/api-client'
import {
  Virtualizer,
  LogCell,
  AccordionCells,
  LogsToolbar,
  LoadMoreButton,
  SelectOption,
  Button,
  LogFiltersDropdown,
} from '@mbari/react-ui'
import { MultiValue } from 'react-select'
import { DateTime } from 'luxon'
import formatEvent, {
  displayNameForEventType,
  isUploadEvent,
} from '../lib/formatEvent'
import {
  applySelectedFilters,
  defaultModalSelections,
  deriveEventTypes,
  hasAllNonDataFiltersSelected,
  hasLogFilterSelection,
  modalVisibleFilterIds,
} from '../lib/logFilters'
import { handleCopyEventLogs } from '../lib/handleCopyEventLogs'
import { createLogger, useDebounce } from '@mbari/utils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChevronDown,
  faChevronUp,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons'
import { RealTimeLogs } from './RealTimeLogs'

const logger = createLogger('components.LogsSection')

export interface LogsSectionProps {
  className?: string
  style?: React.CSSProperties
  vehicleName: string
  from: number // milliseconds since epoch - only used for deployment logs
  to?: number // milliseconds since epoch - only used for deployment logs
  deploymentLogsOnly: boolean
  setDeploymentLogsOnly: (value: boolean) => void
}

const styles = {
  icon: 'ml-1 my-auto flex-grow-0 mr-2 flex-shrink-0',
  emptyLogBanner:
    'flex items-center justify-center gap-0.5 bg-amber-50 px-2 py-6 text-xl text-black',
  emptyLogBannerIcon: 'mr-1 flex-shrink-0 text-amber-600',
}

const LogsSection: React.FC<LogsSectionProps> = ({
  vehicleName,
  from,
  to,
  deploymentLogsOnly,
  setDeploymentLogsOnly,
}) => {
  const toggleDeploymentLogsOnly = () => {
    setDeploymentLogsOnly(!deploymentLogsOnly)
  }

  const { siteConfig } = useTethysApiContext()
  const [filters, setFilters] = useState<MultiValue<SelectOption>>(
    defaultModalSelections
  )
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const debouncedSearchText = useDebounce(searchText, 250)
  const [includeDataEvents, setIncludeDataEvents] = useState(false)

  const modalFilterIds = modalVisibleFilterIds()

  const eventFilterOptions = useMemo(
    () =>
      modalFilterIds.map((id) => ({
        id,
        label: id,
      })),
    [modalFilterIds]
  )
  const allNonDataFiltersSelected = useMemo(
    () => hasAllNonDataFiltersSelected(filters.map((f) => f.id)),
    [filters]
  )

  const hasSelection = useMemo(
    () =>
      hasLogFilterSelection(
        filters.map((f) => f.id),
        includeDataEvents
      ),
    [filters, includeDataEvents]
  )

  const eventTypes = useMemo(
    () =>
      deriveEventTypes(
        filters.map((f) => f.id),
        includeDataEvents
      ),
    [filters, includeDataEvents]
  )

  const deploymentParams = useMemo(
    () => ({
      vehicles: [vehicleName],
      eventTypes,
      from,
      to,
      limit: 500,
    }),
    [vehicleName, eventTypes, from, to]
  )

  const deploymentResponse = useInfiniteEvents(deploymentParams)

  const allLogsParams = useMemo(
    () => ({
      vehicles: [vehicleName],
      eventTypes,
      from: 0,
      limit: 500,
    }),
    [vehicleName, eventTypes]
  )

  const allLogsResponse = useInfiniteEvents(allLogsParams)

  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = deploymentLogsOnly ? deploymentResponse : allLogsResponse

  const flatData = useMemo(() => {
    if (!hasSelection) return []
    if (!data?.pages) return []
    let events = applySelectedFilters(
      data.pages.flat(),
      filters.map(({ id }) => id),
      {
        includeDataEvents,
        allNonDataFiltersSelected,
      }
    )
    if (debouncedSearchText.trim().length) {
      const searchTerm = debouncedSearchText.toLowerCase()
      events = events.filter((e) => {
        const parts = [
          e.note ?? '',
          e.text ?? '',
          e.name ?? '',
          e.path ?? '',
          e.user ?? '',
          e.data ?? '',
        ]
        return parts.some((p) => p.toLowerCase().includes(searchTerm))
      })
    }
    return events
  }, [
    data?.pages,
    filters,
    allNonDataFiltersSelected,
    debouncedSearchText,
    hasSelection,
    includeDataEvents,
  ])
  // Group consecutive timeout notes that share the same event ID into one row.
  // When a mission command is split into N SBD chunks and all N chunks time out,
  // the API emits N separate note events with the same id=XXXXX prefix — all
  // within the same second. This collapses them so the log stays readable.
  //
  // Grouping rules (both must hold):
  //   (a) The note immediately follows the previous note in the list (consecutive).
  //       A non-timeout event or a timeout for a different ID breaks the group.
  //   (b) The note's timestamp is within GROUP_WINDOW_MS of the representative.
  //       This prevents a later retry incident (same command ID, far in time) from
  //       being silently folded into an earlier group.
  //
  // Groups are keyed by the representative's index in processedData so that
  // two separate incidents with the same event ID never share the same bucket.
  const GROUP_WINDOW_MS = 2 * 60 * 1000 // 2 minutes — well above any chunk burst
  type TimeoutGroup = { all: GetEventsResponse[] }
  const { processedData, timeoutGroups } = useMemo(() => {
    const groups = new Map<number, TimeoutGroup>() // key = index in processedData
    const processed: GetEventsResponse[] = []
    let lastGroupIdx: number | undefined = undefined

    flatData.forEach((event) => {
      if (event.eventType !== 'note') {
        processed.push(event)
        lastGroupIdx = undefined
        return
      }
      const match = event.note?.match(timeoutExpiredRegEx)
      if (!match) {
        processed.push(event)
        lastGroupIdx = undefined
        return
      }
      const eventId = Number(match[1])
      const eventMs = event.unixTime ?? 0

      if (lastGroupIdx !== undefined) {
        const openGroup = groups.get(lastGroupIdx)
        const repNote = openGroup?.all[0]
        const repId = repNote?.note
          ? Number(repNote.note.match(timeoutExpiredRegEx)?.[1])
          : NaN
        const repMs = repNote?.unixTime ?? 0
        // Join when consecutive, same command, and within the time window.
        if (repId === eventId && Math.abs(eventMs - repMs) <= GROUP_WINDOW_MS) {
          openGroup!.all.push(event)
          return
        }
      }

      // Start a new group at the current position in processedData.
      const newIdx = processed.length
      groups.set(newIdx, { all: [event] })
      processed.push(event)
      lastGroupIdx = newIdx
    })

    return { processedData: processed, timeoutGroups: groups }
  }, [flatData])

  const [expandedGroupIds, setExpandedGroupIds] = useState<Set<number>>(
    new Set()
  )
  const toggleGroup = useCallback((eventId: number) => {
    setExpandedGroupIds((prev) => {
      const next = new Set(prev)
      if (next.has(eventId)) {
        next.delete(eventId)
      } else {
        next.add(eventId)
      }
      return next
    })
  }, [])

  const dataCount = processedData?.length ?? 0
  const totalCount = hasNextPage ? dataCount + 1 : dataCount
  const listLoading = hasSelection && (isLoading || isFetching)
  const showNoFiltersMessage = !hasSelection && !listLoading
  const accordionCount = showNoFiltersMessage ? 0 : totalCount
  const showNoMatchingEventsMessage =
    hasSelection && !listLoading && dataCount === 0

  const handleLoadMore = () => {
    fetchNextPage()
  }

  const handleToggleFilters = () => {
    setFiltersOpen((prev) => !prev)
  }

  const handleEventFilterChange = (ids: string[]) => {
    setFilters(ids.map((id: string) => ({ id, name: id })))
  }

  const cellAtIndex = (index: number, _v: Virtualizer) => {
    if (hasNextPage && index === dataCount) {
      return (
        <LoadMoreButton
          onClick={handleLoadMore}
          isLoading={isFetchingNextPage}
          label="Load more logs"
        />
      )
    }

    const item = processedData[index]
    if (!item) return <span />

    const isoTime = item.isoTime ?? ''
    const diff = DateTime.fromISO(isoTime).diffNow('days').days
    const date =
      Math.abs(diff) < 1
        ? 'Today'
        : DateTime.fromISO(isoTime).toFormat('yyyy-MM-dd')
    const time = DateTime.fromISO(isoTime).toFormat('H:mm:ss')

    // Check if this item is the representative of a multi-note timeout group.
    // Groups are keyed by the representative's index in processedData, so
    // the lookup is simply timeoutGroups.get(index) — no event-ID lookup needed.
    const isTimeoutNote = item.note?.match(timeoutExpiredRegEx) != null
    const group = isTimeoutNote ? timeoutGroups.get(index) : undefined
    const isGrouped = group != null && group.all.length > 1

    const baseLog = formatEvent(
      item,
      siteConfig?.appConfig.external.tethysdash ?? ''
    )

    const log = isGrouped ? (
      <div className="flex flex-col gap-1 text-sm">
        <div className="flex items-center gap-2">
          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-semibold text-amber-800">
            {group.all.length} timeout notes
          </span>
          <button
            type="button"
            className="text-xs text-primary-600 underline hover:no-underline"
            onClick={() => toggleGroup(index)}
            aria-expanded={expandedGroupIds.has(index)}
          >
            {expandedGroupIds.has(index) ? 'Collapse' : 'Expand all'}
          </button>
        </div>
        {/* Always show the first (representative) note */}
        <div className="opacity-80">{baseLog}</div>
        {/* Show remaining notes only when expanded */}
        {expandedGroupIds.has(index) &&
          group.all.slice(1).map((note) => (
            <div
              key={note.eventId}
              className="border-t border-amber-100 pt-1 opacity-70"
            >
              {formatEvent(
                note,
                siteConfig?.appConfig.external.tethysdash ?? ''
              )}
            </div>
          ))}
      </div>
    ) : (
      baseLog
    )

    return (
      <LogCell
        className="border-b border-slate-200"
        date={date}
        time={time}
        label={displayNameForEventType(item)}
        log={log}
        isUpload={isUploadEvent(item)}
        onCopy={handleCopyEventLogs}
      />
    )
  }

  const handleRefresh = () => refetch()

  return (
    <>
      <header className="flex justify-between p-2">
        <div className="flex items-center gap-2">
          <div
            className="relative"
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <Button appearance="secondary" onClick={handleToggleFilters}>
              Filter{' '}
              <FontAwesomeIcon
                icon={!!filtersOpen ? faChevronDown : faChevronUp}
                className={styles.icon}
              />
            </Button>
            {!!filtersOpen && (
              <div className="absolute z-50">
                <LogFiltersDropdown
                  options={eventFilterOptions}
                  selectedIds={filters.map((f) => f.id)}
                  onChange={handleEventFilterChange}
                  searchValue={searchText}
                  onSearchChange={setSearchText}
                  onDismiss={() => setFiltersOpen(false)}
                  placeholder="Search logs"
                  includeDataEvents={includeDataEvents}
                  onIncludeDataEventsChange={setIncludeDataEvents}
                />
              </div>
            )}
          </div>
          <RealTimeLogs vehicleName={vehicleName} />
        </div>
        <LogsToolbar
          deploymentLogsOnly={deploymentLogsOnly}
          toggleDeploymentLogsOnly={toggleDeploymentLogsOnly}
          disabled={isLoading || isFetching}
          handleRefresh={handleRefresh}
        />
      </header>

      {showNoFiltersMessage ? (
        <div className={styles.emptyLogBanner} role="status">
          <FontAwesomeIcon
            icon={faTriangleExclamation}
            className={styles.emptyLogBannerIcon}
            size="lg"
            aria-hidden
          />
          <p className="m-0">
            Open <strong className="font-semibold">Filter</strong> and choose at
            least one type to see logs.
          </p>
        </div>
      ) : null}
      {showNoMatchingEventsMessage ? (
        <div className={styles.emptyLogBanner} role="status">
          <FontAwesomeIcon
            icon={faTriangleExclamation}
            className={styles.emptyLogBannerIcon}
            size="lg"
            aria-hidden
          />
          <p className="m-0">
            No matching events. Try adjusting{' '}
            <strong className="font-semibold">Filter</strong> or search.
          </p>
        </div>
      ) : null}

      <AccordionCells
        cellAtIndex={cellAtIndex}
        count={accordionCount}
        loading={listLoading}
      />
    </>
  )
}

LogsSection.displayName = 'components.LogsSection'

export default LogsSection
