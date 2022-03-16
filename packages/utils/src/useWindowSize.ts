import { useState, useCallback } from 'react'

import { useResize } from './useResize'

interface WindowSize {
  width: number
  height: number
}

export const useWindowSize = (wait: number = 250): WindowSize => {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  const getWindowSize = useCallback(
    () => ({
      width: window.innerWidth,
      height: window.innerHeight,
    }),
    []
  )

  useResize(() => {
    setWindowSize(getWindowSize)
  }, wait)

  return windowSize
}
