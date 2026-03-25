import React, { useMemo, useState } from 'react'
import {
  EventType,
  useInfiniteEvents,
  useTethysApiContext,
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
  eventFilters,
  isUploadEvent,
} from '../lib/formatEvent'
import { applyEventFilters } from '../lib/eventFilterUtils'
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

const DATA_FILTER_ID = 'Data'

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
  const [filters, setFilters] = useState<MultiValue<SelectOption>>(() =>
    Object.keys(eventFilters)
      .filter((id) => id !== DATA_FILTER_ID)
      .map((id) => ({ id, name: id }))
  )
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const debouncedSearchText = useDebounce(searchText, 250)
  const [includeDataEvents, setIncludeDataEvents] = useState(false)

  const modalEventFilterIds = useMemo(
    () => Object.keys(eventFilters).filter((id) => id !== DATA_FILTER_ID),
    []
  )

  const eventFilterOptions = useMemo(
    () =>
      modalEventFilterIds.map((id) => ({
        id,
        label: id,
      })),
    [modalEventFilterIds]
  )
  const allFiltersSelected = useMemo(
    () => filters.length === modalEventFilterIds.length,
    [filters, modalEventFilterIds]
  )

  const eventTypes = useMemo((): EventType[] | undefined => {
    if (!filters.length || allFiltersSelected) return undefined
    const base = filters
      .flatMap(({ id }) => eventFilters[id].eventTypes)
      .filter((k, i, a) => a.indexOf(k) === i)
    if (includeDataEvents && !base.includes('dataProcessed')) {
      return [...base, 'dataProcessed']
    }
    return base
  }, [filters, allFiltersSelected, includeDataEvents])

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
    if (filters.length === 0) return []
    if (!data?.pages) return []
    let events = data.pages.flat()
    if (filters.length && !allFiltersSelected) {
      const selectedFilterNames = filters.map(({ id }) => id)
      events = applyEventFilters(events, selectedFilterNames)
    }
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
    if (!includeDataEvents) {
      events = events.filter((e) => e.eventType !== 'dataProcessed')
    }
    return events
  }, [
    data?.pages,
    filters,
    allFiltersSelected,
    debouncedSearchText,
    includeDataEvents,
  ])
  const dataCount = flatData?.length ?? 0
  const totalCount = hasNextPage ? dataCount + 1 : dataCount
  const listLoading = filters.length > 0 && (isLoading || isFetching)
  const showNoFiltersMessage = filters.length === 0 && !listLoading
  const accordionCount = showNoFiltersMessage ? 0 : totalCount
  const showNoMatchingEventsMessage =
    filters.length > 0 && !listLoading && dataCount === 0

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

    const item = flatData[index]
    const isoTime = item?.isoTime ?? ''
    const diff = DateTime.fromISO(isoTime).diffNow('days').days
    const date =
      Math.abs(diff) < 1
        ? 'Today'
        : DateTime.fromISO(isoTime).toFormat('yyyy-MM-dd')
    const time = DateTime.fromISO(isoTime).toFormat('H:mm:ss')
    return item ? (
      <LogCell
        className="border-b border-slate-200"
        date={date}
        time={time}
        label={displayNameForEventType(item)}
        log={formatEvent(item, siteConfig?.appConfig.external.tethysdash ?? '')}
        isUpload={isUploadEvent(item)}
        onCopy={handleCopyEventLogs}
      />
    ) : (
      <span />
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
