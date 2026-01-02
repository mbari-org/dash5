import React, { useMemo, useState } from 'react'
import { useInfiniteEvents, useTethysApiContext } from '@mbari/api-client'
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
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'
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
  const [filters, setFilters] = useState<MultiValue<SelectOption>>([])
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const debouncedSearchText = useDebounce(searchText, 250)

  const eventFilterIds = useMemo(() => Object.keys(eventFilters), [])

  const eventFilterOptions = useMemo(
    () =>
      eventFilterIds.map((id) => ({
        id,
        label: id,
      })),
    [eventFilterIds]
  )
  const allFiltersSelected = useMemo(
    () => filters.length === eventFilterIds.length,
    [filters, eventFilterIds]
  )

  const eventTypes = useMemo(
    () =>
      filters.length && !allFiltersSelected
        ? filters
            .map(({ id }) => eventFilters[id].eventTypes)
            .flat()
            .filter((k, i, a) => a.indexOf(k) === i)
        : undefined,
    [filters, allFiltersSelected]
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
    if (!data?.pages) return []
    let events = data.pages.flat()
    if (filters.length) {
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
    return events
  }, [data?.pages, filters, debouncedSearchText])
  const dataCount = flatData?.length ?? 0
  const totalCount = hasNextPage ? dataCount + 1 : dataCount

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
    const time = DateTime.fromISO(isoTime).toFormat('H:mm')
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

      <AccordionCells
        cellAtIndex={cellAtIndex}
        count={totalCount}
        loading={isLoading || isFetching}
      />
    </>
  )
}

LogsSection.displayName = 'components.LogsSection'

export default LogsSection
