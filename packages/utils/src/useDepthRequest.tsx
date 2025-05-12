import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { createLogger } from './index' // Adjust import path as needed

const logger = createLogger('useDepthRequest')

export interface ElevationData {
  depth: number | null
  status: string
  position?: [number, number]
}

export interface DepthRequestOptions {
  toastDuration?: number
  warningToastId?: string
  errorToastId?: string
  loadingToastId?: string
  warningToastClass?: string
  errorToastClass?: string
}

export function useDepthRequest(
  handleDepthRequest: (
    lat: number,
    lng: number
  ) => Promise<{ depth: number | null; status: string }>,
  options: DepthRequestOptions = {}
) {
  // Default options
  const {
    toastDuration = 5000,
    warningToastId = 'depth-unavailable',
    errorToastId = 'depth-result',
    loadingToastId = 'depth-loading',
    warningToastClass = 'blue-toast',
    errorToastClass = '',
  } = options

  const [elevationData, setElevationData] = useState<ElevationData>({
    depth: null,
    status: 'none',
  })
  const [depthWarningShown, setDepthWarningShown] = useState(false)
  // Add a new state to track if loading toast has been shown already
  const [loadingToastShown, setLoadingToastShown] = useState(false)

  const handleDepthRequestWithFeedback = useCallback(
    async (lat: number, lng: number) => {
      try {
        // Only show once
        if (loadingToastId && !loadingToastShown) {
          toast.success('Initializing depth service...', {
            id: loadingToastId,
            duration: 3000,
            className: warningToastClass,
          })
          // Mark the toast as shown so it won't appear again
          setLoadingToastShown(true)
        }

        const result = await handleDepthRequest(lat, lng)

        setElevationData({
          depth: result.depth,
          status: result.status,
          position: [lat, lng],
        })

        // Handle different status responses
        if (result.status === 'success') {
          setDepthWarningShown(false)
        } else if (
          (result.status === 'unavailable' || result.status === 'no-data') &&
          !depthWarningShown
        ) {
          // Only show warning once
          toast.error('⚠️ Map depth data currently unavailable', {
            id: warningToastId,
            duration: toastDuration,
            className: warningToastClass,
          })
          setDepthWarningShown(true)
        }

        logger.debug('Depth request result:', result)
        return result
      } catch (error) {
        logger.error('Depth request error:', error)

        if (!depthWarningShown) {
          toast.error('Error fetching depth data', {
            id: errorToastId,
            duration: toastDuration,
            className: errorToastClass,
          })
          setDepthWarningShown(true)
        }

        return { depth: null, status: 'error' }
      }
    },
    [
      handleDepthRequest,
      depthWarningShown,
      loadingToastId,
      loadingToastShown, // Add this to dependencies
      warningToastId,
      errorToastId,
      toastDuration,
      warningToastClass,
      errorToastClass,
    ]
  )

  return {
    elevationData,
    depthWarningShown,
    handleDepthRequestWithFeedback,
  }
}
