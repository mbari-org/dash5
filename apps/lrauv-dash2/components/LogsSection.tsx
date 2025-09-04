import React, { useMemo, useState } from 'react'
import { useInfiniteEvents, useTethysApiContext } from '@mbari/api-client'
import {
  Virtualizer,
  LogCell,
  MultiSelectField,
  AccordionCells,
  LogsToolbar,
  LoadMoreButton,
  SelectOption,
} from '@mbari/react-ui'
import toast from 'react-hot-toast'
import { MultiValue } from 'react-select'
import { DateTime } from 'luxon'
import formatEvent, {
  displayNameForEventType,
  eventFilters,
  isUploadEvent,
} from '../lib/formatEvent'
import { applyEventFilters } from '../lib/eventFilterUtils'
import { createLogger } from '@mbari/utils'

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

  const eventTypes = useMemo(
    () =>
      filters.length
        ? filters
            .map(({ id }) => eventFilters[id].eventTypes)
            .flat()
            .filter((k, i, a) => a.indexOf(k) === i)
        : undefined,
    [filters]
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
    return events
  }, [data?.pages, filters])
  const dataCount = flatData?.length ?? 0
  const totalCount = hasNextPage ? dataCount + 1 : dataCount

  const handleLoadMore = () => {
    fetchNextPage()
  }

  // Handle copy-paste action
  const handleCopyPaste = (item: any, time: string, date: string) => {
    try {
      // Get log content
      const logContent = formatEvent(
        item,
        siteConfig?.appConfig.external.tethysdash ?? ''
      )

      // Create a complete text representation
      let completeText = `${displayNameForEventType(item)}\n`
      completeText += `Time: ${time}\n`
      completeText += `Date: ${date}\n`
      completeText += `Direction: ${
        isUploadEvent(item) ? 'Upload' : 'Download'
      }\n\n`

      // Add log content
      if (typeof logContent === 'string') {
        completeText += logContent
      } else {
        // Extract text as fallback (only if needed)
        const tempDiv = document.createElement('div')
        const ReactDOM = require('react-dom')
        ReactDOM.render(logContent, tempDiv)
        completeText += tempDiv.textContent || ''
        ReactDOM.unmountComponentAtNode(tempDiv)
      }

      // Copy all text to the clipboard
      navigator.clipboard
        .writeText(completeText)
        .then(() =>
          toast.success('Log copied to clipboard.', {
            duration: 2000,
            className: 'blue-toast',
          })
        )
        .catch((err) => {
          logger.error('Failed to copy:', err)
          toast.error('Failed to copy to clipboard')
        })
    } catch (error) {
      logger.error('Clipboard error:', error)
      toast.error("Your browser doesn't support clipboard access")
    }
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
        onSelect={() => handleCopyPaste(item, time, date)}
      />
    ) : (
      <span />
    )
  }

  const handleRefresh = () => refetch()

  return (
    <>
      <header className="flex justify-between p-2">
        <MultiSelectField
          name="filters"
          value={filters}
          options={Object.keys(eventFilters).map((key) => ({
            name: key,
            id: key,
          }))}
          placeholder="Filter by event type"
          onSelect={(sel) => setFilters(sel ?? [])}
          className="my-auto mr-2 max-w-xs"
          grow
        />
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
