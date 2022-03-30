import React from 'react'
import clsx from "clsx";

export interface AccordionHeaderProps {
  className?: string
  style?: React.CSSProperties
}

export const AccordionHeader: React.FC<AccordionHeaderProps> = ({className, ...props}) => {
  return (
    <div className={clsx("", className)}>
      AccordionHeader Component
    </div>
  )
}

AccordionHeader.displayName = "Components.AccordionHeader";