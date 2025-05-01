import {
  useMemo,
  useState,
  useRef,
  useEffect,
  RefObject,
  MutableRefObject,
} from 'react'
import ResizeObserver from 'resize-observer-polyfill'
import { throttle } from 'lodash'

type ElementType = Element | null | undefined

interface Size {
  width: number
  height: number
}

/**
 * Hook to observe and track element size changes
 * @param element - Reference to the DOM element to observe
 * @param wait - Throttle delay in ms
 * @returns The current size of the observed element
 */
export const useResizeObserver = <T extends ElementType = ElementType>({
  element: elementRef,
  wait = 100,
}: {
  element: RefObject<T> | MutableRefObject<T>
  wait?: number
}) => {
  const [size, setSize] = useState<Size>({ width: 0, height: 0 })
  const observerRef = useRef<ResizeObserver | null>(null)
  const elementPreviouslyObserved = useRef<Element | null>(null)

  // Create throttled callback for performance
  const callback = useMemo(
    () =>
      throttle((entries: ResizeObserverEntry[]) => {
        // Skip processing if no entries
        if (!entries.length) return

        const entry = entries[0]
        let height = 0
        let width = 0

        if (entry.contentBoxSize) {
          // Firefox implements `contentBoxSize` as a single content rect, rather than an array
          const contentBoxSize = Array.isArray(entry.contentBoxSize)
            ? entry.contentBoxSize[0]
            : entry.contentBoxSize

          height = contentBoxSize.blockSize
          width = contentBoxSize.inlineSize
        } else {
          // Fallback for older browsers
          height = entry.contentRect.height
          width = entry.contentRect.width
        }

        // Only update state if dimensions actually changed
        if (size.width !== width || size.height !== height) {
          setSize({
            height,
            width,
          })
        }
      }, wait),
    [wait] // Remove size from dependencies to avoid unnecessary recreations
  )

  useEffect(() => {
    // Safely disconnect any existing observer
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    // Create new observer
    const ResizeObserverOrPolyfill = ResizeObserver
    observerRef.current = new ResizeObserverOrPolyfill(callback)

    // Safely get the element
    const element = elementRef.current

    // Validate element before observing
    if (element && element instanceof Element) {
      try {
        observerRef.current.observe(element)
        elementPreviouslyObserved.current = element
      } catch (error) {
        console.warn('Failed to observe element with ResizeObserver:', error)
      }
    }

    // Cleanup function
    return () => {
      // Cancel any pending throttled callbacks
      callback.cancel()

      // Disconnect observer
      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = null
      }
    }
  }, [elementRef, callback]) // Properly track dependencies

  // Handle element changes (like conditional rendering)
  useEffect(() => {
    const observer = observerRef.current
    if (!observer) return

    const element = elementRef.current
    const previousElement = elementPreviouslyObserved.current

    // Skip if the element hasn't changed
    if (element === previousElement) return

    // Unobserve previous element if it exists
    if (previousElement) {
      try {
        observer.unobserve(previousElement)
      } catch (error) {
        // Ignore errors when unobserving
      }
      elementPreviouslyObserved.current = null
    }

    // Observe new element if valid
    if (element && element instanceof Element) {
      try {
        observer.observe(element)
        elementPreviouslyObserved.current = element
      } catch (error) {
        console.warn(
          'Failed to observe new element with ResizeObserver:',
          error
        )
      }
    }
  }, [elementRef.current]) // Track only the current element

  return { size }
}
