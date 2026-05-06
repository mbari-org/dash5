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
  // Group timeout notes that share the same event ID into a single row.
  // When a mission command is split into N SBD chunks and all N chunks time out,
  // the API emits N separate note events with the same id=XXXXX prefix — all
  // within the same second. This collapses them so the log stays readable.
  //
  // Grouping is intentionally conservative: a note only joins an existing group
  // when (a) it shares the same event ID AND (b) its timestamp is within
  // GROUP_WINDOW_MS of the representative note. This prevents non-consecutive
  // notes (e.g. a retry incident much later) from being silently swallowed into
  // an older group, and preserves correct event ordering in the timeline.
  const GROUP_WINDOW_MS = 2 * 60 * 1000 // 2 minutes — well above any chunk burst
  type TimeoutGroup = {
    representative: GetEventsResponse
    all: GetEventsResponse[]
  }
  const { processedData, timeoutGroups } = useMemo(() => {
    const groups = new Map<number, TimeoutGroup>()
    const processed: GetEventsResponse[] = []

    flatData.forEach((event) => {
      if (event.eventType !== 'note') {
        processed.push(event)
        return
      }
      const match = event.note?.match(timeoutExpiredRegEx)
      if (!match) {
        processed.push(event)
        return
      }
      const eventId = Number(match[1])
      const existing = groups.get(eventId)
      const eventMs = event.unixTime ?? 0
      const representativeMs = existing?.representative.unixTime ?? 0
      // Only join the group when the note is temporally close to the
      // representative (same incident burst). If it falls outside the window,
      // treat it as a new standalone note — don't group across incidents.
      if (existing && Math.abs(eventMs - representativeMs) <= GROUP_WINDOW_MS) {
        existing.all.push(event)
      } else {
        const group: TimeoutGroup = { representative: event, all: [event] }
        groups.set(eventId, group)
        processed.push(event) // only the representative goes into the list
      }
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
    const timeoutMatch = item.note?.match(timeoutExpiredRegEx)
    const groupEventId = timeoutMatch ? Number(timeoutMatch[1]) : undefined
    const group =
      groupEventId != null ? timeoutGroups.get(groupEventId) : undefined
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
            onClick={() => toggleGroup(groupEventId!)}
            aria-expanded={expandedGroupIds.has(groupEventId!)}
          >
            {expandedGroupIds.has(groupEventId!) ? 'Collapse' : 'Expand all'}
          </button>
        </div>
        {/* Always show the first (representative) note */}
        <div className="opacity-80">{baseLog}</div>
        {/* Show remaining notes only when expanded */}
        {expandedGroupIds.has(groupEventId!) &&
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
