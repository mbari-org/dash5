import React, { useEffect, useState, useMemo } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSync } from '@fortawesome/free-solid-svg-icons'
import Tippy from '@tippyjs/react'
import { formatElapsedTime } from '@mbari/utils'

export interface RefreshButtonProps {
  onClick: () => void
  loading?: boolean
  disabled?: boolean
  className?: string
  lastRefreshed?: Date | null
  autoRefreshMinutes?: number
  tooltipPreamble?: string
}

export const RefreshButton: React.FC<RefreshButtonProps> = ({
  onClick,
  loading = false,
  disabled = false,
  className = '',
  lastRefreshed,
  autoRefreshMinutes,
  tooltipPreamble = 'Refresh vehicle positions',
}) => {
  // Update elapsed time every 2 seconds; initial "0s" for first paint
  const [elapsedTime, setElapsedTime] = useState<string>('0s')
  const [nextAutoRefreshCountdown, setNextAutoRefreshCountdown] =
    useState<string>('')

  useEffect(() => {
    if (loading) {
      setElapsedTime('')
      setNextAutoRefreshCountdown('')
      return
    }

    const update = () => {
      // Always update elapsed time (show "0s" if never refreshed)
      if (lastRefreshed) {
        const elapsed = formatElapsedTime(Date.now() - lastRefreshed.getTime())
        setElapsedTime(elapsed)
      } else {
        setElapsedTime('0s')
      }

      // Always update next auto-refresh countdown if auto-refresh is enabled
      if (autoRefreshMinutes) {
        if (lastRefreshed) {
          const nextTime = new Date(
            lastRefreshed.getTime() + autoRefreshMinutes * 60 * 1000
          )
          const timeUntil = nextTime.getTime() - Date.now()
          // Always show countdown (even if < 10 seconds or negative)
          if (timeUntil > 0) {
            setNextAutoRefreshCountdown(formatElapsedTime(timeUntil))
          } else {
            setNextAutoRefreshCountdown('0s')
          }
        } else {
          // If never refreshed, show countdown from now
          setNextAutoRefreshCountdown(
            formatElapsedTime(autoRefreshMinutes * 60 * 1000)
          )
        }
      }
    }

    update() // Initial update
    const interval = setInterval(update, 2000)

    return () => clearInterval(interval)
  }, [lastRefreshed, loading, autoRefreshMinutes])

  // Build tooltip content (effect keeps elapsedTime / nextAutoRefreshCountdown in sync)
  const tooltipContent = (
    <div style={{ whiteSpace: 'nowrap', fontSize: '1em' }}>
      <div>{tooltipPreamble}</div>
      {!loading && (
        <div style={{ marginTop: '0.5em' }}>
          <span>{elapsedTime}</span>
          <span> since last reload.</span>
          {autoRefreshMinutes && (
            <div style={{ marginTop: '0.25em' }}>
              <div>Next auto-refresh in</div>
              <span>{nextAutoRefreshCountdown}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )

  return (
    <Tippy
      content={tooltipContent}
      placement="right-start"
      theme="mapBtnTT"
      delay={1000}
      trigger="mouseenter focus"
    >
      <button
        id="refreshBtn"
        className={`refreshBtn rounded ${className}`}
        aria-label="Refresh vehicle positions"
        onClick={onClick}
        disabled={disabled || loading}
        style={{
          position: 'relative',
          zIndex: 10,
          border: '0px solid rgba(0,0,0,0.2)',
          backgroundClip: 'padding-box',
          width: 42,
          height: 42,
          boxShadow:
            '0 3px 5px -1px rgba(0, 0, 0, 0.2), 0 5px 8px rgba(0, 0, 0, 0.14), 0 1px 14px rgba(0, 0, 0, 0.12)',
        }}
      >
        <FontAwesomeIcon
          icon={faSync}
          size="2xl"
          color="#ffffff"
          className={loading ? 'animate-spin' : ''}
        />
      </button>
    </Tippy>
  )
}
