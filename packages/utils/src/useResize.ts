import { useMemo } from 'react'
import throttle from 'lodash/throttle'
import { useEventListener } from './useEventListener'

type Callback = (event: Event) => void

export const useResize = (callback: Callback, wait: number = 250) => {
  const handleResize = useMemo(
    () =>
      wait !== 0
        ? throttle((event: Event) => callback(event), wait)
        : (event: Event) => callback(event),
    [wait, callback]
  )

  useEventListener({
    type: 'resize',
    listener: handleResize,
  })
}
