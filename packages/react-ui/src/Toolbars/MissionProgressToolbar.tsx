import React from 'react'
import clsx from "clsx";

export interface MissionProgressToolbarProps {
  className?: string
  style?: React.CSSProperties
}

export const MissionProgressToolbar: React.FC<MissionProgressToolbarProps> = ({className, ...props}) => {
  return (
    <div className={clsx("", className)}>
      MissionProgressToolbar Component
    </div>
  )
}

MissionProgressToolbar.displayName = "Components.MissionProgressToolbar";