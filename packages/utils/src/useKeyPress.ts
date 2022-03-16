import { useState, useMemo } from 'react'
import { useEventListener } from './useEventListener'

type KeyboardListener = React.KeyboardEventHandler<Window>

/**
 * Indicates whether or not a key has been pressed.
 * @param targetKey The key to listen for.
 */
export const useKeyPress = (targetKey: string) => {
  const [keyPressed, setKeyPressed] = useState(false)

  const kewDownHandler = useMemo<KeyboardListener>(
    () => ({ key }) => {
      if (key === targetKey) {
        setKeyPressed(true)
      }
    },
    [targetKey]
  )

  useEventListener({
    type: 'keydown',
    listener: kewDownHandler,
  })

  const keyUpHandler = useMemo<KeyboardListener>(
    () => ({ key }) => {
      if (key === targetKey) {
        setKeyPressed(false)
      }
    },
    [targetKey]
  )

  useEventListener({
    type: 'keyup',
    listener: keyUpHandler,
  })

  return keyPressed
}
