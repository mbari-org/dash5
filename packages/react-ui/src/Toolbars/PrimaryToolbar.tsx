import React from 'react'
import clsx from 'clsx'
import { Logo as DefaultLogo } from './Logo'
import { Button, IconButton } from '../Navigation'
import { Avatar } from '../Navigation/Avatar'
import { faPlus, faSignIn, faTimes } from '@fortawesome/pro-regular-svg-icons'
import { faUser } from '@fortawesome/pro-solid-svg-icons'

const styles = {
  bar: 'w-full flex flex-row bg-secondary-300 px-8 py-4',
  list: 'flex flex-row items-center align-center justify-between flex-grow w-full',
  item: 'flex my-auto self-center relative',
  option: 'mr-2',
  logo: 'flex items-center h-8',
}

export interface PrimaryToolbarProps {
  className?: string
  style?: React.CSSProperties
  options?: string[]
  currentOption?: string
  canRemoveOption?: (option: string) => boolean
  onAddClick?: () => void
  onSelectOption?: (option: string) => void
  onRemoveOption?: (option: string) => void
  avatarName?: string
  avatarUrl?: string
  avatarColor?: string
  onAvatarClick?: () => void
  onLoginClick?: () => void
  signedIn?: boolean
  secondaryDropdown?: JSX.Element | null
  addItemDropdown?: JSX.Element | null
  logo?: JSX.Element
}

const PrimaryToolbarOption: React.FC<{
  option: string
  selected: boolean
  onClick: React.MouseEventHandler<HTMLButtonElement>
  onRemove?: (option: string) => void
}> = ({ option, selected, onClick: handleClick, onRemove: handleRemove }) => {
  return (
    <li
      className={clsx(
        styles.item,
        styles.option,
        'rounded transition-all duration-500 ease-in-out',
        selected && 'bg-primary-600',
        selected && handleRemove && 'pr-6'
      )}
    >
      <Button
        appearance={selected ? 'primary' : 'transparent'}
        onClick={handleClick}
        className="capitalize"
      >
        {option}
      </Button>
      {handleRemove && (
        <IconButton
          size="text-md"
          className={clsx(
            selected
              ? 'text-white opacity-100'
              : 'pointer-events-none opacity-0',
            'absolute right-0 my-auto transition-opacity duration-200 ease-out'
          )}
          icon={faTimes}
          onClick={() => handleRemove(option)}
          ariaLabel={`Remove ${option}`}
          tooltip={`Remove ${option}`}
        />
      )}
    </li>
  )
}

export const PrimaryToolbar: React.FC<PrimaryToolbarProps> = ({
  className,
  options,
  currentOption,
  onAddClick: handleAddClick,
  onSelectOption: handleSelectOption,
  onRemoveOption: handleRemoveOption,
  signedIn,
  avatarUrl,
  avatarName,
  avatarColor = '#666',
  onAvatarClick: handleAvatarClick,
  onLoginClick: handleLoginClick,
  secondaryDropdown,
  addItemDropdown,
  canRemoveOption = () => true,
  logo,
}) => {
  const handleOptionClick = (option: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    handleSelectOption?.(option)
  }

  return (
    <nav className={clsx(styles.bar, className)}>
      <ul className={styles.list}>
        <li className={clsx(styles.item, styles.logo, 'mr-6')}>
          {logo ?? <DefaultLogo />}
        </li>
        <li className="flex flex-shrink overflow-x-auto">
          <ul className="flex flex-row items-center">
            {options?.map((option) => (
              <PrimaryToolbarOption
                key={option}
                option={option}
                selected={option === currentOption}
                onClick={handleOptionClick(option)}
                onRemove={
                  canRemoveOption(option) ? handleRemoveOption : undefined
                }
              />
            ))}
          </ul>
        </li>
        {handleAddClick && (
          <li className={clsx(styles.item, styles.option, 'flex-shrink-0')}>
            <IconButton
              onClick={handleAddClick}
              icon={faPlus}
              tooltip="Add Vehicle"
              ariaLabel="Add Vehicle"
            />
            {addItemDropdown}
          </li>
        )}
        <li className="relative my-auto ml-auto flex-shrink-0">
          {!signedIn && (
            <IconButton
              icon={faSignIn}
              tooltip="Login"
              ariaLabel="login"
              onClick={handleLoginClick}
            />
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
              onClick={handleAvatarClick}
            />
          )}
          {secondaryDropdown}
        </li>
      </ul>
    </nav>
  )
}

PrimaryToolbar.displayName = 'Toolbars.PrimaryToolbar'
