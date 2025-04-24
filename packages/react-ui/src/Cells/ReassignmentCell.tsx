import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '../Navigation/Button'
import clsx from 'clsx'

export interface ReassignmentCellProps {
  className?: string
  style?: React.CSSProperties
  isLoading?: boolean
  operators: string[]
  currentUserName: string
  onSignIn: () => void
  onSignOut: () => void
  signInAriaLabel?: string
  signOutAriaLabel?: string
}

const styles = {
  container: 'flex w-fit flex-col items-start font-display list-none gap-0.5',
  signInButton: 'text-primary-600 hover:text-black mt-1.5',
  currentUser: 'mr-1 text-teal-500',
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
}) => {
  const isCurrentUserInList = operators.includes(currentUserName)
  const operatorsList = operators.filter((op) => op !== currentUserName)

  return (
    <ul className={clsx(styles.container, className)} style={style}>
      {!operators.length && <li className="italic text-stone-300">No one</li>}
      {operatorsList.length > 0 &&
        operatorsList.map((operator) => (
          <li key={operator} className="text-stone-500/80">
            {operator}
          </li>
        ))}
      {isCurrentUserInList ? (
        <li className="flex">
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
