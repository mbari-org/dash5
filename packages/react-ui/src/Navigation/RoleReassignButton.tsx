import React from 'react'
import { AccessoryButton } from './AccessoryButton'
import { swallow, createRoleLabel } from '@mbari/utils'
import { faEye } from '@fortawesome/free-regular-svg-icons'

export interface RoleReassignButtonProps {
  pics?: string[]
  onCalls?: string[]
  currentUserName?: string
  onRoleReassign?: () => void
  className?: string
}

export const RoleReassignButton: React.FC<RoleReassignButtonProps> = ({
  pics = [],
  onCalls = [],
  currentUserName,
  onRoleReassign,
  className,
}) => {
  const currentUserIsPic = !!(currentUserName && pics.includes(currentUserName))
  const currentUserIsOnCall = !!(
    currentUserName && onCalls.includes(currentUserName)
  )
  const picLabel = createRoleLabel(pics, 'PIC', currentUserName)
  const onCallLabel = createRoleLabel(onCalls, 'On Call', currentUserName)
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
