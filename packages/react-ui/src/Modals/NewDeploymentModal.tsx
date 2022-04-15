import React from 'react'
import clsx from 'clsx'

export interface NewDeploymentModalProps {
  className?: string
  style?: React.CSSProperties
}

export const NewDeploymentModal: React.FC<NewDeploymentModalProps> = ({
  className,
  ...props
}) => {
  return <div className={clsx('', className)}>NewDeploymentModal Component</div>
}

NewDeploymentModal.displayName = 'Modals.NewDeploymentModal'
