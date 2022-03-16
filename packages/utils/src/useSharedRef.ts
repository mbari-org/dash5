import { MutableRefObject, useRef } from 'react'

type InputRef<T> =
  | ((instance: T | null) => void)
  | MutableRefObject<T | null>
  | null

/**
 * Works like normal useRef, but accepts second argument which is array
 * of additional refs of the same type. Ref value will be shared with
 * all of those provided refs as well.
 *
 * Based on the excellent implementation by Adam Pietrasiak found here:
 * https://github.com/facebook/react/issues/13029#issuecomment-653253748
 */
export function useSharedRef<T>(
  initialValue: T,
  refsToShare: Array<InputRef<T>>
) {
  // actual ref that will hold the value
  const innerRef = useRef<T>(initialValue)

  // ref function that will update innerRef value as well as will publish value to all provided refs
  function sharingRef(value: T) {
    // update inner value
    innerRef.current = value
    // for each provided ref - update it as well
    refsToShare.forEach((resolvableRef) => {
      // react supports various types of refs
      if (typeof resolvableRef === 'function') {
        // if it's functional ref - call it with new value
        resolvableRef(value)
      } else {
        // it should be ref with .current prop
        // make sure it exists - if so - assign new value
        if (resolvableRef) {
          ;(resolvableRef as any).current = value
        }
      }
    })
  }

  /**
   * We want ref we return to work using .current, but it has to be function in order
   * to share value with other refs.
   *
   * Let's add custom get property called 'current' that will return
   * fresh value of innerRef.current
   */
  if (!(sharingRef as any).current) {
    Object.defineProperty(sharingRef, 'current', {
      get() {
        return innerRef.current
      },
    })
  }

  return sharingRef as typeof sharingRef & { current: T }
}
