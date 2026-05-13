import React from 'react'
import clsx from 'clsx'
import {
  faSync,
  faGripLines,
  faAlignJustify,
} from '@fortawesome/free-solid-svg-icons'
import { IconToggle } from '../Indicators'
import { IconButton } from '../Navigation'
import { HistoricalListIcon, SubIcon } from '../Icons'

export interface LogsToolbarProps {
  deploymentLogsOnly: boolean
  toggleDeploymentLogsOnly: () => void
  disabled: boolean
  handleRefresh: () => void
  /** Compact relative string for the last successful fetch, e.g. "2m ago". */
  lastUpdatedAgo?: string
  /** When true, the log list is rendered in compact/dense mode. */
  compact?: boolean
  /** Called when the user toggles compact mode. */
  onToggleCompact?: () => void
  className?: string
}

export const LogsToolbar: React.FC<LogsToolbarProps> = ({
  deploymentLogsOnly,
  toggleDeploymentLogsOnly,
  disabled,
  handleRefresh,
  lastUpdatedAgo,
  compact = false,
  onToggleCompact,
  className,
}) => (
  <div className={clsx('flex items-center gap-2', className)}>
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
      className="mr-2"
      disabled={disabled}
    />

    {lastUpdatedAgo && (
      <div
        className="flex flex-col items-center text-[9px] leading-tight text-stone-400"
        aria-live="polite"
      >
        <span>Updated</span>
        <span>{lastUpdatedAgo.replace(/ ago$/, '')}</span>
        <span>ago</span>
      </div>
    )}

    {onToggleCompact && (
      <IconButton
        icon={compact ? faAlignJustify : faGripLines}
        ariaLabel={
          compact ? 'Switch to comfortable view' : 'Switch to compact view'
        }
        tooltipAlignment="right"
        tooltip={
          compact ? 'Switch to comfortable view' : 'Switch to compact view'
        }
        onClick={onToggleCompact}
        disabled={disabled}
        size="text-md"
        iconClassName={clsx(
          'text-xl',
          compact ? 'text-blue-500' : 'text-gray-400'
        )}
        className="flex items-center justify-center"
      />
    )}

    <IconButton
      icon={faSync}
      ariaLabel="reload"
      tooltipAlignment="right"
      tooltip="Refresh logs"
      disabled={disabled}
      onClick={handleRefresh}
      size="text-md"
      iconClassName="text-xl"
      className="flex shrink-0 items-center justify-center rounded-full border-2 border-blue-400 text-blue-400"
    />
  </div>
)

LogsToolbar.displayName = 'Toolbars.LogsToolbar'
