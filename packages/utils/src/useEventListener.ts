import { useEffect, useRef, useCallback, RefObject } from 'react'
import { getElement } from './getElement'

interface UseEventListenerProps<T> {
  type: keyof WindowEventMap
  listener: T
  element?: RefObject<Element> | Document | Window
  options?: AddEventListenerOptions
}

export const useEventListener = <
  T extends React.EventHandler<any> = EventListener
>({
  type,
  listener,
  element = window,
  options,
}: UseEventListenerProps<T>) => {
  const savedListener = useRef(null as T | EventListener | null)

  useEffect(() => {
    savedListener.current = listener
  }, [listener])

  const handleEventListener = useCallback((event: Event) => {
    const listener = savedListener.current
    listener?.(event)
  }, [])

  useEffect(() => {
    const target = getElement(element)

    target?.addEventListener(type, handleEventListener)

    return () => target?.removeEventListener(type, handleEventListener)
  }, [type, element, options, handleEventListener])
}
