import React, { FC } from 'react'

export const TabGroup: FC = ({ children }) => {
  return <div className="flex flex-row">{children}</div>
}

TabGroup.displayName = 'Navigation.TabGroup'
