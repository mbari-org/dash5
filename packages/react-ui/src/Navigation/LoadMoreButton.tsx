import clsx from 'clsx'
import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowCircleDown } from '@fortawesome/free-solid-svg-icons'

interface LoadMoreButtonProps {
  onClick: () => void
  isLoading?: boolean
  className?: string
  label?: string
}
const styles = {
  button:
    'uppercase text-lg flex h-16 w-full items-center justify-center text-primary-600/80 hover:bg-secondary-300/60 disabled:opacity-40',
}
// This is for use with a virtualized list, where the last item is a button that fetches the next page of data.
export const LoadMoreButton: React.FC<LoadMoreButtonProps> = ({
  onClick,
  isLoading = false,
  className,
  label,
}) => {
  const labelText = label ?? 'Load more'
  return (
    <button
      aria-label="Load more"
      onClick={onClick}
      disabled={isLoading}
      className={clsx(styles.button, className)}
    >
      <FontAwesomeIcon icon={faArrowCircleDown} className="mr-1.5 mt-0.5" />
      {isLoading ? 'Loading…' : labelText}
    </button>
  )
}
