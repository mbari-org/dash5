import React, { useMemo, useState } from 'react'
import { useInfiniteEvents, useTethysApiContext } from '@mbari/api-client'
import {
  Virtualizer,
  LogCell,
  IconButton,
  MultiSelectField,
  AccordionCells,
  HistoricalListIcon,
  IconToggle,
  SubIcon,
  LoadMoreButton,
} from '@mbari/react-ui'
import toast from 'react-hot-toast'
import { MultiValue } from 'react-select'
import { DateTime } from 'luxon'
import clsx from 'clsx'
import formatEvent, {
  displayNameForEventType,
  eventFilters,
  isUploadEvent,
} from '../lib/formatEvent'
import { faSync } from '@fortawesome/free-solid-svg-icons'
import { SelectOption } from '@mbari/react-ui/dist/Fields/Select'
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
    return data.pages.flat()
  }, [data?.pages])
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

        <div className="flex items-center">
          <IconToggle
            iconLeft={
              <HistoricalListIcon
                className={clsx(
                  'transition-colors duration-300',
                  deploymentLogsOnly ? 'text-gray-400' : 'text-black'
                )}
              />
            }
            iconRight={
              <SubIcon
                className={clsx(
                  'transition-colors duration-300',
                  deploymentLogsOnly ? 'text-black' : 'text-gray-400'
                )}
              />
            }
            isToggled={deploymentLogsOnly}
            onToggle={toggleDeploymentLogsOnly}
            tooltip={
              deploymentLogsOnly
                ? 'Displaying deployment logs'
                : 'Displaying all logs'
            }
            tooltipAlignment="right"
            ariaLabelLeft="Displaying all logs"
            ariaLabelRight="Displaying deployment logs"
            className="mr-4"
          />

          <IconButton
            icon={faSync}
            ariaLabel="reload"
            tooltipAlignment="right"
            tooltip="Refresh logs"
            disabled={isLoading || isFetching}
            onClick={handleRefresh}
            size="text-md"
            iconClassName="text-xl"
            className="flex items-center justify-center rounded-full border-2 border-blue-400 text-blue-400"
          />
        </div>
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
