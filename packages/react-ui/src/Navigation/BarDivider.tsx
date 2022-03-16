import clsx from 'clsx'
import React, { FC } from 'react'

export const BarDivider: FC<{ className?: string }> = ({ className }) => (
  <span className={clsx('mx-3 my-2 w-px bg-stone-200', className)} />
)

BarDivider.displayName = 'Navigation.BarDivider'
