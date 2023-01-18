import { useEffect, useRef, useCallback, RefObject } from 'react'

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
  element = typeof window !== 'undefined' ? window : undefined,
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
    const target =
      element && 'current' in element
        ? (element as RefObject<Element>)?.current
        : element

    target?.addEventListener(type, handleEventListener)

    return () => target?.removeEventListener(type, handleEventListener)
  }, [type, element, options, handleEventListener])
}
