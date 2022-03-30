import React from 'react'
import clsx from 'clsx'
import { Logo } from './Logo'
import { Button, IconButton } from '../Navigation'
import { Avatar } from '../Navigation/Avatar'
import { faPlus, faSignIn } from '@fortawesome/pro-regular-svg-icons'
import { faUser } from '@fortawesome/pro-solid-svg-icons'

const styles = {
  bar: 'w-full flex flex-row bg-secondary-300 px-8 py-4',
  list: 'flex flex-row items-center align-center justify-between flex-grow',
  item: 'flex my-auto self-center',
  option: 'mr-2',
}

export interface PrimaryToolbarProps {
  className?: string
  style?: React.CSSProperties
  options?: string[]
  currentOption?: string
  onAddClick?: () => void
  onSelectOption?: (option: string) => void
  avatarName?: string
  avatarUrl?: string
  avatarColor?: string
  onAvatarClick?: () => void
  signedIn?: boolean
}

export const PrimaryToolbar: React.FC<PrimaryToolbarProps> = ({
  className,
  options,
  currentOption,
  onAddClick: handleAddClick,
  onSelectOption: handleSelectOption,
  signedIn,
  avatarUrl,
  avatarName,
  avatarColor = '#666',
  onAvatarClick: handleAvatarClick,
}) => {
  const handleOptionClick = (option: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    handleSelectOption?.(option)
  }

  return (
    <nav className={clsx(styles.bar, className)}>
      <ul className={styles.list}>
        <li className={clsx(styles.item, 'mr-6')}>
          <Logo />
        </li>
        {options?.map((option) => (
          <li key={option} className={clsx(styles.item, styles.option)}>
            <Button
              appearance={currentOption === option ? 'primary' : 'transparent'}
              onClick={handleOptionClick(option)}
            >
              {option}
            </Button>
          </li>
        ))}
        {handleAddClick && (
          <li className={clsx(styles.item, styles.option)}>
            <IconButton
              onClick={handleAddClick}
              icon={faPlus}
              tooltip="Add Vehicle"
              ariaLabel="Add Vehicle"
            />
          </li>
        )}
        <li className="my-auto ml-auto">
          {!signedIn && (
            <IconButton icon={faSignIn} tooltip="Login" ariaLabel="login" />
          )}
          {signedIn && !avatarName && (
            <IconButton
              onClick={handleAvatarClick}
              icon={faUser}
              ariaLabel="View Profile"
            />
          )}
          {signedIn && avatarName && (
            <Avatar
              name={avatarName}
              color={avatarColor}
              imageUrl={avatarUrl}
            />
          )}
        </li>
      </ul>
    </nav>
  )
}

PrimaryToolbar.displayName = 'Components.PrimaryToolbar'
