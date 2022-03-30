import React from 'react'
import clsx from "clsx";

export interface ScheduleCellProps {
  className?: string
  style?: React.CSSProperties
}

export const ScheduleCell: React.FC<ScheduleCellProps> = ({className, ...props}) => {
  return (
    <div className={clsx("", className)}>
      ScheduleCell Component
    </div>
  )
}

ScheduleCell.displayName = "Components.ScheduleCell";