import React, { Dispatch, useContext, useReducer } from 'react'

type CoordArray = [number, number][]

interface SharedPathState {
  [key: string]: CoordArray
}

type SharedPathAction =
  | {
      type: 'append' | 'remove'
      coords: SharedPathState
    }
  | { type: 'clear' }

type PathReducer = (
  state: SharedPathState,
  action: SharedPathAction
) => SharedPathState

const pathReducer: PathReducer = (state, action) => {
  switch (action.type) {
    case 'append': {
      return { ...state, ...action.coords }
    }
    case 'remove': {
      return Object.keys(action.coords)
        .reduce((res, key) => res.filter((k) => k !== key), Object.keys(state))
        .reduce((res, k) => ({ ...res, [k]: state[k] }), {})
    }
    case 'clear': {
      return {}
    }
    default: {
      throw new Error(`Unhandled action type: ${action}`)
    }
  }
}

const SharedPathContext = React.createContext<{
  sharedPath: SharedPathState
  dispatch: Dispatch<SharedPathAction>
}>({
  sharedPath: {},
  dispatch: () => undefined,
})

export const SharedPathContextProvider: React.FC = ({ children }) => {
  const [sharedPath, dispatch] = useReducer(pathReducer, {})
  return (
    <SharedPathContext.Provider value={{ sharedPath, dispatch }}>
      {children}
    </SharedPathContext.Provider>
  )
}

export const useSharedPath = () => {
  const context = React.useContext(SharedPathContext)
  if (context === undefined) {
    throw new Error(
      'useSharedPath must be used within a SharedPathContextProvider'
    )
  }
  return context
}
