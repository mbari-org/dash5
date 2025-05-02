import { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { useTethysApiContext } from '@mbari/api-client'
import { useQueryClient } from 'react-query'
import { createLogger } from '@mbari/utils'

const logger = createLogger('WebSocketService')

// Connection configuration
const CONFIG = {
  MAX_RETRIES: 5,
  INITIAL_RETRY_DELAY_MS: 1000,
  MAX_RETRY_DELAY_MS: 30000, // Max 30 seconds between retries
  CONNECTION_TIMEOUT_MS: 10000, // 10 second timeout for connection attempts
  NORMAL_CLOSE_CODE: 1000,
}

// Type definitions
type SubscriptionEventType =
  | 'VehicleConnected'
  | 'VehiclePingResult'
  | 'presence'
  | null

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

export const SUPPORTED_EVENT_TYPES: SubscriptionEventType[] = [
  'VehicleConnected',
  'VehiclePingResult',
  'presence',
]

export interface TethysSubscriptionEvent {
  eventName?: string
  vehicleName?: string
  hostName?: string
  checkedAt?: number
  presence?: string
  reachable?: boolean
  email?: string
}

/**
 * Custom hook for managing WebSocket connections to the Tethys subscription service
 * @returns Connection status information
 */
export const useTethysSubscription = () => {
  const { token, profile } = useTethysApiContext()
  const queryClient = useQueryClient()
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>('disconnected')
  const [connectionError, setConnectionError] = useState<Error | null>(null)

  // Refs for tracking connection state
  const websocketRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const retryCountRef = useRef<number>(0)
  const isUnmountingRef = useRef<boolean>(false)

  // Create WebSocket URL with proper formatting to prevent double slashes
  const url = useMemo(() => {
    if (!profile?.email || !token) return null

    // Remove any trailing slashes from the base URL to prevent double slashes
    const baseUrl = (process.env.NEXT_PUBLIC_WEBSOCKET_URL || '').replace(
      /\/+$/,
      ''
    )
    const formattedUrl = `${baseUrl}/${token}?aem=${encodeURIComponent(
      profile.email
    )}`

    return formattedUrl
  }, [token, profile?.email])

  /**
   * Clean up all timers and existing connections
   */
  const cleanupResources = useCallback(() => {
    // Clear connection timeout
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current)
      connectionTimeoutRef.current = null
    }

    // Clear reconnection timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    // Close WebSocket if open
    if (websocketRef.current) {
      try {
        // Only log if we're not unmounting
        if (!isUnmountingRef.current) {
          logger.debug('Closing existing WebSocket connection')
        }

        // Check if connection isn't already closed
        if (websocketRef.current.readyState !== WebSocket.CLOSED) {
          websocketRef.current.close(CONFIG.NORMAL_CLOSE_CODE, 'Cleanup')
        }
      } catch (error) {
        // Ignore any errors during cleanup
      } finally {
        websocketRef.current = null
      }
    }
  }, [])

  /**
   * Get exponential backoff delay with jitter
   */
  const getBackoffDelay = useCallback((retryCount: number) => {
    // Calculate exponential backoff: 2^retryCount * initialDelay
    const exponentialDelay = Math.min(
      CONFIG.INITIAL_RETRY_DELAY_MS * Math.pow(2, retryCount),
      CONFIG.MAX_RETRY_DELAY_MS
    )

    // Add jitter (±20% variation) to prevent thundering herd
    const jitter = exponentialDelay * 0.2 * (Math.random() * 2 - 1)

    return Math.floor(exponentialDelay + jitter)
  }, [])

  // Handle WebSocket connection and events
  useEffect(() => {
    if (!url) {
      logger.debug('No WebSocket URL available - missing token or profile')
      return cleanupResources
    }

    // Reset unmounting flag
    isUnmountingRef.current = false

    // Clean up any existing resources first
    cleanupResources()

    /**
     * Attempts to establish a WebSocket connection with retry logic
     */
    const connectWebSocket = () => {
      try {
        // Clean up any existing connections first
        cleanupResources()

        logger.debug(`Connecting to WebSocket: ${url}`)
        setConnectionStatus('connecting')
        setConnectionError(null)

        // Create new WebSocket connection
        const ws = new WebSocket(url)
        websocketRef.current = ws

        // Set connection timeout
        connectionTimeoutRef.current = setTimeout(() => {
          logger.warn('WebSocket connection attempt timed out')

          // Only proceed if this is still the active connection attempt
          if (websocketRef.current === ws) {
            setConnectionStatus('error')
            setConnectionError(new Error('Connection timed out'))

            // Close the socket if it's still open/connecting
            if (ws.readyState !== WebSocket.CLOSED) {
              ws.close()
            }

            // Try to reconnect
            handleReconnect()
          }
        }, CONFIG.CONNECTION_TIMEOUT_MS)

        // Connection successfully established
        ws.onopen = () => {
          // Clear connection timeout
          if (connectionTimeoutRef.current) {
            clearTimeout(connectionTimeoutRef.current)
            connectionTimeoutRef.current = null
          }

          logger.info('✅ WebSocket connection established')
          setConnectionStatus('connected')
          retryCountRef.current = 0 // Reset retry counter on successful connection
        }

        // Handle incoming messages
        ws.onmessage = (event) => {
          if (!event.data) return

          try {
            const data = JSON.parse(event.data) as TethysSubscriptionEvent

            // Validate event type
            if (
              !SUPPORTED_EVENT_TYPES.includes(
                (data.eventName ?? null) as SubscriptionEventType
              )
            ) {
              // logger.debug(`Unsupported event type: ${data.eventName}`)
              return
            }

            // Create query key from event data
            const queryKey = [
              data.eventName,
              data.vehicleName,
              data.email,
            ].filter(Boolean) // Filter out undefined/null values

            // Update React Query cache
            queryClient.invalidateQueries({ queryKey })
            queryClient.setQueryData(queryKey, data)
          } catch (parseError) {
            logger.error('Failed to parse WebSocket message:', parseError)
          }
        }

        // Handle errors - using the safer approach to avoid React errors
        ws.onerror = (event) => {
          // Clear connection timeout if it exists
          if (connectionTimeoutRef.current) {
            clearTimeout(connectionTimeoutRef.current)
            connectionTimeoutRef.current = null
          }

          // Log the error but don't create a new Error object in the handler
          logger.error('WebSocket error occurred', {
            url,
            readyState: ws.readyState,
          })

          // Update connection state
          setTimeout(() => {
            if (!isUnmountingRef.current) {
              setConnectionStatus('error')
              setConnectionError(new Error('Connection failed'))
            }
          }, 0)
        }

        // Handle disconnection
        ws.onclose = (event) => {
          // Clear connection timeout if it exists
          if (connectionTimeoutRef.current) {
            clearTimeout(connectionTimeoutRef.current)
            connectionTimeoutRef.current = null
          }

          logger.debug(
            `WebSocket closed with code ${event.code}: ${
              event.reason || 'No reason provided'
            }`
          )

          if (!isUnmountingRef.current) {
            setConnectionStatus('disconnected')
            websocketRef.current = null

            // Don't reconnect on normal closure
            if (event.code !== CONFIG.NORMAL_CLOSE_CODE) {
              handleReconnect()
            }
          }
        }
      } catch (setupError) {
        logger.error('Failed to setup WebSocket:', setupError)

        if (!isUnmountingRef.current) {
          setConnectionError(
            setupError instanceof Error
              ? setupError
              : new Error(String(setupError))
          )
          setConnectionStatus('error')

          // Try to reconnect
          handleReconnect()
        }
      }
    }

    /**
     * Handles reconnection attempts with exponential backoff
     */
    const handleReconnect = () => {
      if (isUnmountingRef.current) return

      if (retryCountRef.current < CONFIG.MAX_RETRIES) {
        retryCountRef.current++

        const delay = getBackoffDelay(retryCountRef.current)

        logger.debug(
          `Attempting to reconnect (${retryCountRef.current}/${CONFIG.MAX_RETRIES}) in ${delay}ms`
        )

        reconnectTimeoutRef.current = setTimeout(() => {
          if (!isUnmountingRef.current) {
            connectWebSocket()
          }
        }, delay)
      } else {
        logger.warn(`Max reconnection attempts reached (${CONFIG.MAX_RETRIES})`)

        if (!isUnmountingRef.current) {
          setConnectionError(
            new Error(
              'Failed to establish WebSocket connection after multiple attempts'
            )
          )
        }
      }
    }

    // Start the initial connection
    connectWebSocket()

    // Cleanup function
    return () => {
      isUnmountingRef.current = true
      cleanupResources()
    }
  }, [url, queryClient, cleanupResources, getBackoffDelay])

  // Return connection info that can be used by consuming components
  return {
    connectionStatus,
    connectionError,
    isConnected: connectionStatus === 'connected',
  }
}

/**
 * Hook to subscribe to specific Tethys events by type and scope
 * @param eventType - Type of event to subscribe to
 * @param scope - Scope of the subscription (e.g., vehicle name)
 * @returns The latest event data
 */
export const useTethysSubscriptionEvent = (
  eventType: SubscriptionEventType,
  scope: string
): TethysSubscriptionEvent | undefined => {
  const queryClient = useQueryClient()
  const [eventData, setEventData] = useState<
    TethysSubscriptionEvent | undefined
  >(queryClient.getQueryData([eventType, scope]) as TethysSubscriptionEvent)

  // Subscribe to updates for this specific event
  useEffect(() => {
    const queryKey = [eventType, scope].filter(Boolean)

    // Get initial data
    const initialData = queryClient.getQueryData(
      queryKey
    ) as TethysSubscriptionEvent
    if (initialData) {
      setEventData(initialData)
    }

    // Setup subscription to query updates
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (
        event?.type === 'queryUpdated' &&
        Array.isArray(event.query.queryKey) &&
        event.query.queryKey[0] === eventType &&
        event.query.queryKey[1] === scope
      ) {
        setEventData(event.query.state.data as TethysSubscriptionEvent)
      }
    })

    return unsubscribe
  }, [eventType, scope, queryClient])

  return eventData
}
