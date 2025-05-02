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
        if (size.width !== width || size.height !== height) {
          setSize({
            height,
            width,
          })
        }
      }, wait),
    [setSize, wait, size]
  )

  useEffect(() => {
    const element: Element = elementRef.current as any
    if (elementRef.current) {
      observerRef.current?.unobserve(element)
    }
    const ResizeObserverOrPolyfill = ResizeObserver
    observerRef.current = new ResizeObserverOrPolyfill(callback)
    if (elementRef.current) {
      observerRef.current?.observe(element)
    }

    return () => {
      if (elementRef.current) {
        observerRef.current?.unobserve(element)
      }
    }
  }, [elementRef, wait, observerRef])

  return { size }
}
