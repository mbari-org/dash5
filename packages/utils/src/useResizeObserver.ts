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

export const useResizeObserver = <T>({
  element: elementRef,
  wait = 100,
}: {
  element: RefObject<T> | MutableRefObject<T>
  wait?: number
}) => {
  const [size, setSize] = useState({ width: 0, height: 0 })
  const observerRef = useRef<ResizeObserver | null>(null)

  const callback = useMemo(
    () =>
      throttle((entries) => {
        let height = 0
        let width = 0
        for (let entry of entries) {
          if (entry.contentBoxSize) {
            // Firefox implements `contentBoxSize` as a single content rect, rather than an array
            const contentBoxSize = Array.isArray(entry.contentBoxSize)
              ? entry.contentBoxSize[0]
              : entry.contentBoxSize
            height = contentBoxSize.blockSize
            width = contentBoxSize.inlineSize
          } else {
            height = entry.contentRect.height
            width = entry.contentRect.width
          }
        }
        setSize((prev) => {
          if (prev.width !== width || prev.height !== height) {
            return { height, width }
          }
          return prev
        })
      }, wait),
    [wait]
  )

  useEffect(() => {
    // Disconnect the previous observer before replacing it so no stale
    // observer continues to fire after a callback/element/wait change.
    observerRef.current?.disconnect()

    const ResizeObserverOrPolyfill = ResizeObserver
    observerRef.current = new ResizeObserverOrPolyfill(callback)
    if (elementRef.current) {
      observerRef.current.observe(elementRef.current as unknown as Element)
    }

    return () => {
      // Cancel any pending throttle invocation and disconnect unconditionally —
      // React may null refs before cleanup runs, so we cannot rely on
      // elementRef.current being truthy here.
      callback.cancel()
      observerRef.current?.disconnect()
    }
  }, [elementRef, wait, observerRef, callback])

  return { size }
}
