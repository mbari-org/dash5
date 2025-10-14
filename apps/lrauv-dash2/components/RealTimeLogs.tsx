import React, { useMemo } from 'react'
import { useEvents, useTethysApiContext } from '@mbari/api-client'
import { Button } from '@mbari/react-ui'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExternalLink } from '@fortawesome/free-solid-svg-icons'

export interface RealTimeLogsProps {
  vehicleName: string
}

export const RealTimeLogs: React.FC<RealTimeLogsProps> = ({ vehicleName }) => {
  const { siteConfig } = useTethysApiContext()

  // Latest dataProcessed event (for Shore Log link)
  const { data: latestDataProcessed } = useEvents(
    {
      vehicles: [vehicleName],
      eventTypes: ['dataProcessed'],
      from: 0,
      limit: 1,
      ascending: 'n',
    },
    { staleTime: 60 * 1000 }
  )

  const espUrl = useMemo(() => {
    const base = siteConfig?.appConfig.external.tethysdash
    if (!base || !vehicleName) return undefined
    return `${base}/data/${vehicleName}/realtime/ESPlogs/`
  }, [siteConfig, vehicleName])

  const shoreUrl = useMemo(() => {
    const base = siteConfig?.appConfig.external.tethysdash
    const path = latestDataProcessed?.[0]?.path
    if (!base || !vehicleName || !path) return undefined
    return `${base}/data/${vehicleName}/realtime/sbdlogs/${path}/shore.log`
  }, [siteConfig, vehicleName, latestDataProcessed])

  const handleEspClick = () => {
    if (!espUrl) return
    window.open(espUrl, '_blank', 'noopener,noreferrer')
  }

  const handleShoreClick = () => {
    if (!shoreUrl) return
    window.open(shoreUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <>
      <Button
        appearance="secondary"
        onClick={handleShoreClick}
        disabled={!shoreUrl}
        aria-label="Open shore log file in a new browser tab"
      >
        <FontAwesomeIcon icon={faExternalLink} className="mr-2" />
        Shore Log
      </Button>

      <Button
        appearance="secondary"
        onClick={handleEspClick}
        disabled={!espUrl}
        aria-label="Open ESP Logs listing in a new browser tab"
      >
        <FontAwesomeIcon icon={faExternalLink} className="mr-2" />
        ESP Log
      </Button>
    </>
  )
}

RealTimeLogs.displayName = 'components.RealTimeLogs'
