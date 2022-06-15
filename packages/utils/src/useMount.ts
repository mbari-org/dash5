import { useEffect, useState } from 'react'

/**
 * Combines useState and useEffect to create a stateful value that is updated
 * once the component using this hook has mounted.
 */
export const useMount = (delay: number = 0) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      setMounted(true)
    }, delay)
  })

  return mounted
}
