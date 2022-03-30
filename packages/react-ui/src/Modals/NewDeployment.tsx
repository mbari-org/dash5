import React from 'react'
import clsx from 'clsx'

export interface NewDeploymentProps {
  className?: string
  style?: React.CSSProperties
}

export const NewDeployment: React.FC<NewDeploymentProps> = ({
  className,
  ...props
}) => {
  return <div className={clsx('', className)}>NewDeployment Component</div>
}

NewDeployment.displayName = 'Components.NewDeployment'
