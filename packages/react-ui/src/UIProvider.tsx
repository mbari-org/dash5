import React from 'react'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { DndProvider } from 'react-dnd'
import { RecoilRoot } from 'recoil'
import { MuiPickersUtilsProvider } from '@material-ui/pickers'
import LuxonUtils from '@date-io/luxon'

export const UIProvider: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  return (
    <MuiPickersUtilsProvider utils={LuxonUtils}>
      <RecoilRoot>
        <DndProvider backend={HTML5Backend}>{children}</DndProvider>
      </RecoilRoot>
    </MuiPickersUtilsProvider>
  )
}
