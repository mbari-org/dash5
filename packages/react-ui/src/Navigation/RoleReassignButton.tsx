import React from 'react'
import { AccessoryButton } from './AccessoryButton'
import { swallow, createRoleLabel } from '@mbari/utils'
import { faEye } from '@fortawesome/free-regular-svg-icons'

export interface RoleReassignButtonProps {
  pics?: string[]
  onCalls?: string[]
  currentUserName?: string
  authenticated?: boolean
  loading?: boolean
  onRoleReassign?: () => void
  className?: string
}

export const RoleReassignButton: React.FC<RoleReassignButtonProps> = ({
  pics = [],
  onCalls = [],
  currentUserName,
  authenticated,
  loading,
  onRoleReassign,
  className,
}) => {
  const currentUserIsPic = !!(currentUserName && pics.includes(currentUserName))
  const currentUserIsOnCall = !!(
    currentUserName && onCalls.includes(currentUserName)
  )
  const picLabel = createRoleLabel({
    operators: pics,
    role: 'PIC',
    loading,
    currentUser: currentUserName,
    authenticated,
  })
  const onCallLabel = createRoleLabel({
    operators: onCalls,
    role: 'On-Call',
    loading,
    currentUser: currentUserName,
    authenticated,
  })
  return (
    <AccessoryButton
      label={picLabel}
      secondary={onCallLabel}
      icon={faEye}
      onClick={onRoleReassign ? swallow(onRoleReassign) : undefined}
      isActive={currentUserIsPic}
      isSecondaryActive={currentUserIsOnCall}
      className={className}
    />
  )
}

RoleReassignButton.displayName = 'Navigation.RoleReassignButton'
