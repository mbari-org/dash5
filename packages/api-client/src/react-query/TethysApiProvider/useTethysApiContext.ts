import { useContext } from 'react'
import { TethysApiContext } from './TethysApiContext'

export const useTethysApiContext = () => {
  const context = useContext(TethysApiContext)
  if (context === undefined) {
    throw new Error(
      'useTethysApiContext must be used within a TethysApiProvider'
    )
  }
  return context
}
