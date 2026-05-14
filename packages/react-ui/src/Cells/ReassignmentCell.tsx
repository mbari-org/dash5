import React, { useEffect, useState } from 'react'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '../Navigation/Button'
import clsx from 'clsx'

export interface ReassignmentOperator {
  user: string
  unixTime: number
}

export interface ReassignmentCellProps {
  className?: string
  style?: React.CSSProperties
  isLoading?: boolean
  operators: ReassignmentOperator[]
  currentUserName: string
  onSignIn: () => void
  onSignOut: () => void
  signInAriaLabel?: string
  signOutAriaLabel?: string
  /** When true, shows elapsed watch time next to the current user's name. */
  showElapsed?: boolean
}

const styles = {
  container: 'flex w-fit flex-col items-start font-display list-none gap-0.5',
  signInButton: 'text-stone-500 hover:text-stone-800 mt-1.5',
  currentUser: 'mr-1 text-primary-600',
  otherOperator: 'text-primary-600',
}

/** Format elapsed ms as "Xh Ym" or "Ym" for durations under 1 hour. */
const formatElapsed = (sinceMs: number): string => {
  const totalMinutes = Math.floor(sinceMs / 60_000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

export const ReassignmentCell: React.FC<ReassignmentCellProps> = ({
  className,
  style,
  isLoading,
  operators,
  currentUserName,
  onSignIn,
  onSignOut,
  signInAriaLabel,
  signOutAriaLabel,
  showElapsed = false,
}) => {
  const isCurrentUserInList = operators.some(
    (op) => op.user === currentUserName
  )
  const currentUserEntry = operators.find((op) => op.user === currentUserName)
  const otherOperators = operators.filter((op) => op.user !== currentUserName)

  // Tick every minute so the elapsed label stays live while the modal is open.
  // Depend on primitives (not the object reference) so the interval is not
  // recreated on every parent re-render caused by React Query refetches.
  const [now, setNow] = useState(() => Date.now())
  const signInUnixTime = currentUserEntry?.unixTime
  const signInUser = currentUserEntry?.user
  useEffect(() => {
    if (!showElapsed || !signInUnixTime || !signInUser) return
    const id = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(id)
  }, [showElapsed, signInUnixTime, signInUser])

  const elapsedLabel = (() => {
    if (!showElapsed || !currentUserEntry) return null
    const elapsed = now - currentUserEntry.unixTime
    if (elapsed < 0) return null
    return `(signed in ${formatElapsed(elapsed)})`
  })()

  return (
    <ul className={clsx(styles.container, className)} style={style}>
      {!operators.length && <li className="italic text-stone-300">No one</li>}
      {otherOperators.map((op) => (
        <li key={op.user} className={styles.otherOperator}>
          {op.user}
        </li>
      ))}
      {isCurrentUserInList ? (
        <li className="flex flex-col items-start">
          <div className="flex items-center">
            <span className={styles.currentUser}>{currentUserName}</span>
            <Button
              onClick={onSignOut}
              disabled={isLoading}
              appearance="custom"
              aria-label={signOutAriaLabel}
            >
              <FontAwesomeIcon
                icon={faXmark}
                size="lg"
                className={clsx(
                  'text-red-500',
                  !isLoading && 'hover:text-red-700'
                )}
              />
            </Button>
          </div>
          {elapsedLabel && (
            <span className="text-xs text-stone-400">{elapsedLabel}</span>
          )}
        </li>
      ) : (
        <li>
          <Button
            onClick={onSignIn}
            disabled={isLoading}
            className={styles.signInButton}
            appearance="custom"
            aria-label={signInAriaLabel}
          >
            Join
          </Button>
        </li>
      )}
    </ul>
  )
}

ReassignmentCell.displayName = 'Cells.ReassignmentCell'
