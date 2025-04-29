import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import {
  TileLayer,
  MapContainer,
  WMSTileLayer,
  LayersControl,
  ScaleControl,
  useMapEvents,
} from 'react-leaflet'
import ReactLeafletGoogleLayer from 'react-leaflet-google-layer'
import Control from 'react-leaflet-custom-control'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-measure/dist/leaflet-measure.css'
import '@mbari/react-ui/dist/mbari-ui.css'
import '@mbari/react-ui/src/css/base.css'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import MouseCoordinates, { MouseCoordinatesProps } from './MouseCoordinates'
import { useMapBaseLayer, BaseLayerOption } from './useMapBaseLayer'
import 'leaflet-mouse-position'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowsToCircle,
  faCircleCheck,
  faRulerCombined,
  faArrowsUpDownLeftRight,
  faLocationDot,
  faPaintBrush,
} from '@fortawesome/free-solid-svg-icons'
import { faCircleXmark } from '@fortawesome/free-regular-svg-icons'
import { Measurement } from './Measurement'
import MovingDot from './MovingDot'
import { AreaComponent, PathComponent, MeasurementProps } from './Measurement'
import { CenterView } from './MapViews'
import toast from 'react-hot-toast'
import { createLogger, loadGoogleMapsOnce } from '@mbari/utils'
import VehicleColorsModal from '@mbari/lrauv-dash2/components/VehicleColorsModal'

const logger = createLogger('Map')

// safeLogger wrapper that suppresses debug logs during critical operations
const createSafeLogger = (
  originalLogger: any,
  disabledLevels: string[] = ['debug']
) => {
  // Copy of the original logger
  const safeLogger = { ...originalLogger }

  // Disable specified log levels by replacing them with no-op functions
  disabledLevels.forEach((level) => {
    if (level in safeLogger) {
      safeLogger[level] = () => {} // No-op function
    }
  })

  return safeLogger
}

// safeLogger instance that will be used during initialization
const safeLogger = createSafeLogger(logger, ['debug'])

const regex = /\B(?=(\d{3})+(?!\d))/g

declare global {
  interface Window {
    _googleMapsLoaded?: boolean
    google?: any
  }
}

let mapCoord: String
let dmsCoord: String

interface StoredMarker {
  id: number
  lat: number
  lng: number
  label: string
  iconColor?: string
  visible?: boolean
  savedToLayer?: boolean
}

export interface MapProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  style?: React.CSSProperties
  center?: [number, number]
  centerZoom?: number
  zoom?: number
  minZoom?: number
  maxZoom?: number
  maxNativeZoom?: number
  fitBounds?: [[number, number], [number, number]]
  viewMode?: 'center' | 'bounds' | null
  scrollWheelZoom?: boolean
  isAddingMarkers?: boolean
  onToggleMarkerMode?: () => void
  onRequestMarkers?: (position?: { top: number; left: number }) => void
  onRequestDepth?: MouseCoordinatesProps['onRequestDepth']
  onRequestCoordinate?: () => void
  onRequestFitBounds?: () => void
  onRequestPlatforms?: () => void
  onRequestStations?: (position?: { top: number; left: number }) => void
  onRequestVehicleColors?: (vehicleName?: string) => void
  whenCreated?: (map: L.Map) => void
  onMapReady?: (map: L.Map) => void
  trackedVehicles?: Array<{ id: string; name: string }>
  dmsCoord?: string
  mapCoord?: string
  children?: React.ReactNode
  renderMapClickHandler?: (props: {
    isAddingMarkers: boolean
    isEditingMarker: boolean
    onAddMarker: (lat: number, lng: number) => number
  }) => React.ReactNode
  renderCustomMarkerSet?: (props: {
    isAddingMarkers: boolean
    setIsAddingMarkers: React.Dispatch<React.SetStateAction<boolean>>
  }) => React.ReactNode
  renderDraggableMarkers?: (props: {
    markers: Array<{
      id: number
      lat: number
      lng: number
      index: number
      label: string
    }>
    handleMarkerDragEnd: (
      id: number,
      position: { lat: number; lng: number }
    ) => void
  }) => React.ReactNode
}

export type MeasureMode = 'open' | 'measuring' | 'closed' | 'cancelled'

const Map = React.forwardRef<L.Map, MapProps>(
  (
    {
      className,
      style,
      center = [36.7849, -122.12097],
      centerZoom,
      zoom = 17,
      minZoom = 4,
      maxZoom = 17,
      maxNativeZoom = 13,
      fitBounds,
      viewMode,
      trackedVehicles = [],
      children,
      isAddingMarkers = false,
      onToggleMarkerMode,
      onRequestMarkers,
      onRequestDepth,
      onRequestCoordinate,
      onRequestFitBounds,
      onRequestPlatforms,
      onRequestStations,
      onRequestVehicleColors,
      onMapReady,
      renderMapClickHandler,
      renderCustomMarkerSet,
      renderDraggableMarkers,
    },
    ref
  ) => {
    interface TrackedVehicle {
      id: string
      name: string
      [key: string]: any // Add additional properties as needed
    }

    const mapRef = useRef<L.Map | null>(null)
    const layersButtonRef = useRef<HTMLButtonElement>(null)
    const [mapReady, setMapReady] = useState(false)

    const [googleMapsStatus, setGoogleMapsStatus] = useState<
      'pending' | 'loading' | 'loaded' | 'error'
    >('pending')
    const [isMeasuring, setIsMeasuring] = useState(false)
    const [isAddingMarkersLocal, setIsAddingMarkersLocal] =
      useState(isAddingMarkers)
    const { baseLayer, setBaseLayer } = useMapBaseLayer()
    const addBaseLayerHandler = useCallback(
      (layer: BaseLayerOption) => () => {
        setBaseLayer(layer)
      },
      [setBaseLayer]
    )
    const [showVehicleColorsModal, setShowVehicleColorsModal] = useState(false)
    const vehicleColorsButtonRef = useRef<HTMLButtonElement>(null)
    const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 })

    // Google Maps initialization
    useEffect(() => {
      // Only initialize Google Maps after map is ready
      const handleMapReady = async (event: CustomEvent) => {
        // Extract the map instance from the event
        const map = event.detail as L.Map
        if (!map) {
          logger.error('Map instance not found in mapready event')
          setGoogleMapsStatus('error')
          return
        }

        // Use safeLogger for non-critical logs
        safeLogger.debug('Map ready event received, initializing Google Maps')
        setGoogleMapsStatus('loading')

        try {
          safeLogger.debug('Loading leaflet.gridlayer.googlemutant...')

          // Load Google Maps API first (this ensures custom elements are registered once)
          await loadGoogleMapsOnce()

          // Load the Leaflet plugin
          let GoogleMutant
          try {
            GoogleMutant = await import('leaflet.gridlayer.googlemutant')
          } catch (err) {
            safeLogger.debug('Trying alternative import path...')
            try {
              GoogleMutant = await import('leaflet.gridlayer.googlemutant')
            } catch (err2) {
              logger.error('Failed to import from node_modules path:', err2)
              throw err
            }
          }

          if (!window.google) {
            logger.error('Google Maps API still not available after loading')
            setGoogleMapsStatus('error')
            return
          }

          // Check if Google Maps is already loaded
          safeLogger.debug('Creating Google Maps layer...')
          const googleLayer = L.gridLayer.googleMutant({
            type: 'hybrid',
            maxZoom: maxZoom,
            maxNativeZoom: maxNativeZoom,
          })

          safeLogger.debug('Adding Google Maps layer to map...')
          googleLayer.addTo(map)

          // Store the layer for future reference
          // @ts-ignore - Adding custom property
          map._googleLayer = googleLayer

          setGoogleMapsStatus('loaded')
          safeLogger.debug('✅ Google Maps layer added successfully!')
        } catch (error) {
          setGoogleMapsStatus('error')
          logger.error('Failed to initialize Google Maps layer:', error)
        }
      }

      // Listen for mapReady event
      if (typeof window !== 'undefined') {
        window.addEventListener(
          'mapready',
          handleMapReady as unknown as EventListener
        )

        return () => {
          window.removeEventListener(
            'mapready',
            handleMapReady as unknown as EventListener
          )
        }
      }
    }, [maxZoom, maxNativeZoom])

    // Create measurements
    const [measurements, setMeasurements] = useState<
      {
        id: string
        editing?: boolean
        showPopup?: boolean
      }[]
    >([])

    const [markers, setMarkers] = useState<
      Array<{
        id: number
        lat: number
        lng: number
        index: number
        label: string
        savedToLayer?: boolean
      }>
    >([])

    const [clickablePoints, setClickablePoints] = useState<
      Array<{ id: number; lat: number; lng: number }>
    >([])

    const [count, setCount] = useState(0)
    const [isHovering, setIsHovering] = useState(false)

    const measStyle = {
      color: '#00008b',
      fontFamily: 'Helvetica Neue, Arial, Helvetica, sans- serif',
      fontSize: '12px',
    }

    // Skip the log if ref is null - this is expected during initial render
    useEffect(() => {
      if (ref && !mapRef.current) {
        // Don't log every time - very noisy
        return
      }

      // Forward the ref
      if (typeof ref === 'function') {
        ref(mapRef.current)
      } else if (ref && typeof ref === 'object') {
        ref.current = mapRef.current
      }
    }, [ref])

    // Function to convert coordinate in deg to DMS
    function ConvertDEGToDMS(deg: number, dir: boolean) {
      var absolute = Math.abs(deg)
      var degrees = Math.floor(absolute)
      var minutesNotTruncated = (absolute - degrees) * 60
      var minutes = Math.floor(minutesNotTruncated)
      var seconds = ((minutesNotTruncated - minutes) * 60).toFixed(2)
      if (dir) {
        var direction = deg >= 0 ? 'N' : 'S'
      } else {
        var direction = deg >= 0 ? 'E' : 'W'
      }
      return degrees + '° ' + minutes + "' " + seconds + '" ' + direction
    }

    ///////////////////////////////////////////////////////////////
    // Clicking on and determining map coordinates and formatting
    //////////////////////////////////////////////////////////////
    const MeasureEvents = () => {
      useMapEvents({
        click(e) {
          let dir = true
          mapCoord = e.latlng.lat.toFixed(6) + '  /  ' + e.latlng.lng.toFixed(6)
          let latDMS = ConvertDEGToDMS(e.latlng.lat, dir)
          dir = false
          let lngDMS = ConvertDEGToDMS(e.latlng.lng, dir)
          dmsCoord = latDMS + ' / ' + lngDMS
          setCount(count + 1)
        },
      })
      return (
        <div hidden>
          {dmsCoord}
          {mapCoord}
        </div>
      )
    }

    let element = <div></div>
    if (count == 0) {
      element = (
        <>
          Continue clicking on the map to measure distance or area
          <br />
          <br />
        </>
      )
    } else if (count == 1) {
      element = (
        <>
          Last Point
          <br />
          <div style={measStyle}>
            {dmsCoord}
            <br />
            {mapCoord}
          </div>
          <hr className="hr-round"></hr>
          <br />
        </>
      )
    } else if (count == 2) {
      element = (
        <>
          Last Point
          <br />
          <div style={measStyle}>
            {dmsCoord}
            <br />
            {mapCoord}
          </div>
          <hr className="hr-round"></hr>
          <br />
          Path Distance
          <br />
          <div style={measStyle}>
            <PathComponent />
          </div>
          <hr className="hr-round"></hr>
          <br />
        </>
      )
    } else if (count >= 3) {
      element = (
        <>
          Last Point
          <br />
          <div style={measStyle}>
            {dmsCoord}
            <br />
            {mapCoord}
          </div>
          <hr className="hr-round"></hr>
          <br />
          Path Distance
          <br />
          <div style={measStyle}>
            <PathComponent />
          </div>
          <hr className="hr-round"></hr>
          <br />
          Area
          <br />
          <div style={measStyle}>
            <AreaComponent />
          </div>
          <hr className="hr-round"></hr>
          <br />
        </>
      )
    }

    const gmrtLayer = useMemo(
      () => (
        <LayersControl.BaseLayer name="GMRT">
          <WMSTileLayer
            params={{
              layers: 'GMRT',
              format: 'image/png',
            }}
            url="https://www.gmrt.org/services/mapserver/wms_merc?"
            maxNativeZoom={maxNativeZoom}
            minZoom={minZoom}
            maxZoom={maxZoom}
            eventHandlers={{
              add: addBaseLayerHandler('GMRT'),
            }}
          />{' '}
        </LayersControl.BaseLayer>
      ),
      [addBaseLayerHandler, maxNativeZoom, minZoom, maxZoom]
    )

    ////////////////////////////////////////
    // Create measureMode and setMeasureMode
    const [measureMode, setMeasureMode] = useState<MeasureMode>('closed')
    // Create showDot and setShowDot
    const [visibleDot, setVisibleDot] = useState('hidden')
    // Set the default cursor
    const [cursor, setCursor] = useState('default')

    ///////////////////////////////////////////
    //  changeMeasureMode
    const changeMeasureMode = (mode: MeasureMode) => (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      // Set flag to prevent centering during measurements
      if (mode === 'open' || mode === 'measuring') {
        setIsMeasuring(true)
      } else {
        setIsMeasuring(false)
      }

      if (mode === 'open') {
        setCount(0)
      }
      if (mode === 'measuring') {
        setCount(0)
        setMeasurements((prev) => [
          ...prev,
          {
            id: Date.now().toLocaleString(),
            editing: true,
            showPopup: false,
          },
        ])
      }
      if (mode === 'closed') {
        setCount(0)
        setMeasurements((prev) =>
          prev.map((p) => ({
            ...p,
            editing: false,
            showPopup: true, // true when finishing
          }))
        )
      }
      if (mode === 'cancelled') {
        setCount(0)
        setMeasurements((prev) => [])
      }
      setMeasureMode(mode)
    }

    // Handle Request Fit Bounds
    const handleRequestFitBounds = (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      onRequestFitBounds?.()
    }

    // Handle mouse over event
    const handleMouseOver = (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setVisibleDot('hidden')
    }

    // Handle Add Marker
    const handleAddMarker = useCallback(
      (lat: number, lng: number) => {
        const newId = Date.now() // Generate unique ID

        // Add the new marker to state
        setMarkers((prev) => [
          ...prev,
          {
            id: newId,
            lat: lat,
            lng: lng,
            index: prev.length,
            label: `Marker ${prev.length + 1}`,
          },
        ])

        // Call onRequestMarkers for any additional functionality
        onRequestMarkers?.()

        return newId
      },
      [onRequestMarkers]
    )

    const handleToggleMarkerMode = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsAddingMarkersLocal((prev) => !prev)
        onToggleMarkerMode?.()
      },
      [onToggleMarkerMode]
    )

    // Handle marker drag end event
    const handleMarkerDragEnd = useCallback(
      (id: number, position: { lat: number; lng: number }) => {
        logger.debug(
          `Marker ${id} dragged to [${position.lat}, ${position.lng}]`
        )

        setMarkers((prev) => {
          // Create updated array with new position
          const updated = prev.map((marker) =>
            marker.id === id
              ? {
                  ...marker,
                  lat: position.lat,
                  lng: position.lng,
                  isNew: false, // Mark as not new after dragging
                }
              : marker
          )

          // If this marker is already saved to layer, update the layer storage too
          const draggedMarker = updated.find((m) => m.id === id)
          if (draggedMarker?.savedToLayer) {
            localStorage.setItem(
              'layerMarkers',
              JSON.stringify(updated.filter((m) => m.savedToLayer))
            )
            logger.debug(`Updated layer storage for marker ${id}`)
          }

          // Always update the main storage
          localStorage.setItem('savedMarkers', JSON.stringify(updated))

          return updated
        })
        // Note: Toast here handled by the main context
      },
      []
    )

    // Handle mouse over event for the TrackDB button
    const handleLayersClick = (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      // Get button position
      if (layersButtonRef.current) {
        const rect = layersButtonRef.current.getBoundingClientRect()
        const position = {
          top: rect.bottom,
          left: rect.left,
        }

        // Pass position to callbacks
        onRequestStations?.(position)
        onRequestMarkers?.(position)
      } else {
        onRequestStations?.()
        onRequestMarkers?.()
      }
    }

    // Handle mouse over event for the Vehicle Colors button
    const handleVehicleColorsClick = () => {
      if (vehicleColorsButtonRef.current) {
        const rect = vehicleColorsButtonRef.current.getBoundingClientRect()
        setModalPosition({
          top: rect.bottom + 40,
          left: rect.left,
        })
      }
      setShowVehicleColorsModal(!showVehicleColorsModal)
    }

    // Remove Measurement
    const removeMeasurement = useCallback(
      (id: string) => () => {
        setMeasurements((prev) => prev.filter((m) => m.id !== id))
      },
      []
    )

    // Wait for map to be fully initialized before setting mapReady to true
    useEffect(() => {
      const timer = setTimeout(() => {
        setMapReady(true)
      }, 2000)
      return () => clearTimeout(timer)
    }, [])

    // Add a saved marker to the JSON object Marker file
    const addSavedMarker = useCallback((savedMarker: StoredMarker) => {
      setMarkers((prev) => [
        ...prev,
        {
          id: savedMarker.id || Date.now(),
          lat: savedMarker.lat,
          lng: savedMarker.lng,
          index: prev.length,
          label: savedMarker.label || `Marker ${prev.length + 1}`,
          // Copy any other properties you need
        },
      ])
    }, [])

    // Update your useEffect to load saved markers from localStorage
    useEffect(() => {
      // Load saved layer markers from localStorage on mount
      const savedLayerMarkers = localStorage.getItem('layerMarkers')
      if (savedLayerMarkers) {
        try {
          const markers = JSON.parse(savedLayerMarkers) as StoredMarker[]
          // Add these markers to your state
          markers.forEach((marker: StoredMarker) => {
            // Set savedToLayer flag and add to markers state
            addSavedMarker({
              ...marker,
              savedToLayer: true,
            })
          })
        } catch (e) {
          logger.error('Error loading saved markers:', e)
        }
      }
    }, [addSavedMarker])

    // Handle cursor changes when marker mode is toggled
    useEffect(() => {
      // Get the map container
      const mapContainer = document.querySelector('.leaflet-container')
      if (mapContainer) {
        // Set cursor style based on isAddingMarkers state
        if (isAddingMarkers) {
          mapContainer.classList.add('adding-markers-cursor')
        } else {
          mapContainer.classList.remove('adding-markers-cursor')
        }
      }
      // Clean up on unmount
      return () => {
        if (mapContainer) {
          mapContainer.classList.remove('adding-markers-cursor')
        }
      }
    }, [isAddingMarkers])

    return (
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className={className}
        style={style}
        minZoom={minZoom}
        maxZoom={maxZoom}
        // @ts-ignore
        maxNativeZoom={maxNativeZoom}
        ref={mapRef}
        whenCreated={(map: L.Map) => {
          try {
            if (!map) {
              logger.warn('Map instance is null in whenCreated')
              return
            }

            safeLogger.debug('Map instance created, initializing...')

            // Store reference to actual Leaflet map
            mapRef.current = map

            // Forward the reference
            if (ref) {
              if (typeof ref === 'function') {
                ref(map)
              } else {
                ref.current = map
              }
              safeLogger.debug('Map reference forwarded')
            }

            // Call onMapReady
            if (onMapReady) {
              safeLogger.debug('Calling onMapReady callback')
              onMapReady(map)
            }

            // Dispatch with minimal delay
            setTimeout(() => {
              if (typeof window !== 'undefined') {
                try {
                  // Use safeLogger for this chatty operation
                  safeLogger.debug('Creating mapready event')

                  const mapReadyEvent = new CustomEvent('mapready', {
                    detail: map,
                  })
                  window.dispatchEvent(mapReadyEvent)

                  // This log is important enough to keep!
                  logger.info('mapready event dispatched')
                } catch (e) {
                  logger.error('Error dispatching mapready event:', e)
                }
              }
            }, 100)
          } catch (err) {
            logger.error('Error in map initialization:', err)
          }
        }}
      >
        {!isMeasuring && (
          <CenterView
            coords={center as [number, number]}
            bounds={fitBounds as [[number, number], [number, number]]}
            zoom={centerZoom as number}
            viewMode={viewMode as 'center' | 'bounds' | null}
          />
        )}
        {renderMapClickHandler &&
          renderMapClickHandler({
            isAddingMarkers: isAddingMarkersLocal,
            isEditingMarker: false,
            onAddMarker: handleAddMarker,
          })}
        {renderCustomMarkerSet &&
          renderCustomMarkerSet({
            isAddingMarkers: isAddingMarkersLocal,
            setIsAddingMarkers: setIsAddingMarkersLocal,
          })}
        {renderDraggableMarkers &&
          renderDraggableMarkers({
            markers,
            handleMarkerDragEnd,
          })}
        <ScaleControl position="topright" />
        <LayersControl position="topright">
          {mapReady && (
            <LayersControl.BaseLayer
              name="Google Hybrid"
              checked={baseLayer === 'Google Hybrid'}
            >
              <ReactLeafletGoogleLayer
                useGoogMapsLoader={false}
                type="hybrid"
                eventHandlers={{
                  add: addBaseLayerHandler('Google Hybrid'),
                }}
              />
            </LayersControl.BaseLayer>
          )}
          {mapReady && (
            <LayersControl.BaseLayer
              name="ESRI Oceans/Labels"
              checked={baseLayer === 'ESRI Oceans/Labels'}
            >
              <TileLayer
                url="https://ibasemaps-api.arcgis.com/arcgis/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}?//token=<ACCESS_TOKEN>process.env.REACT_APP_ESRI_API_KEY</ACCESS_TOKEN>"
                attribution='&copy; <a href="https://developers.arcgis.com/">ArcGIS</a>'
                maxNativeZoom={maxNativeZoom}
                eventHandlers={{
                  add: addBaseLayerHandler('ESRI Oceans/Labels'),
                }}
              />
            </LayersControl.BaseLayer>
          )}
          {gmrtLayer}
          {mapReady && (
            <LayersControl.BaseLayer
              name="OpenStreetmaps"
              checked={baseLayer === 'OpenStreetmaps'}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                eventHandlers={{
                  add: addBaseLayerHandler('OpenStreetmaps'),
                }}
              />
            </LayersControl.BaseLayer>
          )}
          {mapReady && (
            <LayersControl.BaseLayer
              name="Dark Layer (CARTO)"
              checked={baseLayer === 'Dark Layer (CARTO)'}
            >
              <TileLayer
                attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_nolabels/{z}/{x}/{y}.png"
                eventHandlers={{
                  add: addBaseLayerHandler('Dark Layer (CARTO)'),
                }}
              />
            </LayersControl.BaseLayer>
          )}
        </LayersControl>
        <Control prepend position="topright">
          <MouseCoordinates onRequestDepth={onRequestDepth} />
        </Control>
        {children}
        {/* TRACKDB/STATIONS CONTROLS - Now in separate Control component */}
        <Control position="topleft">
          <Tippy
            content="Edit Vehicle Colors"
            placement="right-start"
            theme="mapBtnTT"
          >
            <button
              id="vehicleColors"
              ref={vehicleColorsButtonRef}
              className="vehicleColors rounded"
              aria-label="Vehicle Colors"
              onMouseOver={handleMouseOver}
              style={{
                position: 'relative',
                zIndex: isHovering ? 900 : 10,
                border: '0px solid rgba(0,0,0,0.2)',
                backgroundClip: 'padding-box',
                width: 35,
                height: 35,
              }}
              onClick={handleVehicleColorsClick}
            >
              <FontAwesomeIcon icon={faPaintBrush} size="xl" color="#ffffff" />
            </button>
          </Tippy>
          <hr style={{ height: '8pt', visibility: 'hidden' }} />
          <Tippy
            content="Track Database"
            placement="right-start"
            theme="mapBtnTT"
          >
            <button
              id="trackdb"
              className="trackdb rounded"
              aria-label="Track Database"
              onMouseOver={handleMouseOver}
              style={{
                position: 'relative',
                zIndex: isHovering ? 900 : 10,
                border: '0px solid rgba(0,0,0,0.2)',
                backgroundClip: 'padding-box',
                width: 55,
                height: 30,
              }}
              onClick={onRequestPlatforms}
            >
              <span style={{ color: '#FFFFFF' }}>TrackDB</span>
            </button>
          </Tippy>
          <hr style={{ height: '8pt', visibility: 'hidden' }} />
          <Tippy
            content="Stations Database"
            placement="right-start"
            theme="mapBtnTT"
          >
            <button
              ref={layersButtonRef}
              id="mapLayersdb"
              className="mapLayersdb rounded"
              aria-label="Map Layers Database"
              onMouseOver={handleMouseOver}
              style={{
                position: 'relative',
                zIndex: isHovering ? 900 : 10,
                border: '0px solid rgba(0,0,0,0.2)',
                backgroundClip: 'padding-box',
                width: 55,
                height: 30,
              }}
              onClick={handleLayersClick}
            >
              <span style={{ color: '#FFFFFF' }}>Layers</span>
            </button>
          </Tippy>
        </Control>

        {/* COORDINATE CONTROLS */}
        {onRequestCoordinate || onRequestFitBounds || onToggleMarkerMode ? (
          <Control position="topleft">
            {onRequestCoordinate && (
              <>
                <Tippy
                  content="Center map on centroid of latest GPS Fix positions"
                  placement="right-start"
                  theme="mapBtnTT"
                >
                  <button
                    id="vehicle-center"
                    className="vehicle-center rounded"
                    aria-label="Center map on vehicle"
                    onMouseOver={handleMouseOver}
                    style={{
                      position: 'relative',
                      zIndex: isHovering ? 900 : 10,
                      border: '0px solid rgba(0,0,0,0.2)',
                      backgroundClip: 'padding-box',
                      width: 42,
                      height: 42,
                    }}
                    onClick={onRequestCoordinate}
                  >
                    <FontAwesomeIcon
                      icon={faArrowsToCircle}
                      size="2xl"
                      color="#ffffff"
                    />
                  </button>
                </Tippy>
                <hr style={{ height: '8pt', visibility: 'hidden' }} />
              </>
            )}

            {onRequestFitBounds && (
              <>
                <Tippy
                  content="Zoom out to all available/selected vehicles"
                  placement="right-start"
                  theme="mapBtnTT"
                >
                  <button
                    id="allVehicles-center"
                    className="allVehicles-center rounded"
                    aria-label="Center map on all vehicles"
                    onMouseOver={handleMouseOver}
                    style={{
                      position: 'relative',
                      zIndex: isHovering ? 900 : 10,
                      border: '0px solid rgba(0,0,0,0.2)',
                      backgroundClip: 'padding-box',
                      width: 42,
                      height: 42,
                    }}
                    onClick={handleRequestFitBounds}
                  >
                    <FontAwesomeIcon
                      icon={faArrowsUpDownLeftRight}
                      size="2xl"
                      color="#ffffff"
                    />
                  </button>
                </Tippy>
                <hr style={{ height: '8pt', visibility: 'hidden' }} />
              </>
            )}

            {onToggleMarkerMode && (
              <>
                <Tippy
                  content={
                    isAddingMarkers
                      ? 'Cancel adding markers'
                      : 'Add markers to map'
                  }
                  placement="right-start"
                  theme="mapBtnTT"
                >
                  <button
                    id="toggle-markers"
                    className="toggle-markers rounded"
                    aria-label="Toggle marker mode"
                    onMouseOver={handleMouseOver}
                    style={{
                      position: 'relative',
                      zIndex: isHovering ? 900 : 10,
                      border: '0px solid rgba(0,0,0,0.2)',
                      backgroundClip: 'padding-box',
                      width: 42,
                      height: 42,
                    }}
                    onClick={handleToggleMarkerMode}
                  >
                    <FontAwesomeIcon
                      icon={faLocationDot}
                      size="2xl"
                      className={isAddingMarkers ? 'pulsing-icon' : ''}
                      color={isAddingMarkers ? '#FF0000' : '#ffffff'}
                    />
                  </button>
                </Tippy>
                <hr style={{ height: '8pt', visibility: 'hidden' }} />
              </>
            )}
          </Control>
        ) : null}

        {/* MEASUREMENT CONTROLS - In a separate Control component */}
        <Control position="topright">
          {measurements.map((m) => (
            <React.Fragment key={m.id}>
              <Measurement
                editing={m.editing}
                showPopup={m.showPopup} // Pass the flag here
                onDelete={removeMeasurement(m.id)}
              />
              <MovingDot editing={m.editing} />
            </React.Fragment>
          ))}
          {/* Measurement mode: OPEN */}
          {measureMode === 'open' ? (
            <div
              id="measModeOpen"
              className="leaflet-pointer rounded bg-white text-stone-500"
              onDragStart={() => setCursor('pointer')}
              style={{
                border: '2px solid rgba(0,0,0,0.2)',
                backgroundClip: 'padding-box',
                width: 250,
                maxWidth: 250,
              }}
            >
              <p className="measure-info" cursor-pointer>
                <a
                  id="createMeasLink"
                  className="mousechange:hover cursor-pointer:onHover leaflet-pointer text-bg-blue-600 hover:text-bg-blue-800 w-full bg-white"
                  onClick={(e) => changeMeasureMode('measuring')(e)}
                >
                  <FontAwesomeIcon
                    icon={faCircleCheck}
                    size="xl"
                    id="circleCheck"
                    style={{
                      marginLeft: '.5rem',
                      marginRight: '0.25rem',
                    }}
                  />
                  {'    '} Create A New Measurement {'    '}
                </a>
                <button
                  id="closeMeasBtn"
                  className="mousechange:hover cursor-pointer:onHover p-1"
                  aria-label="Close Measurement"
                  onClick={(e) => changeMeasureMode('closed')(e)}
                  onMouseOver={handleMouseOver}
                  style={{
                    position: 'relative',
                    zIndex: isHovering ? 900 : 10,
                  }}
                >
                  <FontAwesomeIcon
                    icon={faCircleXmark}
                    size="xl"
                    id="xMark"
                    style={{ marginLeft: '1rem' }}
                  />
                </button>
              </p>
            </div>
          ) : null}
          {/* Measurement mode: MEASURING */}
          {measureMode === 'measuring' ? (
            <div
              id="measModeMeasuring"
              className="cursor-pointer:onHover rounded bg-white p-2 text-stone-500"
              style={{
                border: '2px solid rgba(0,0,0,0.2)',
                backgroundClip: 'padding-box',
                width: 250,
                maxWidth: 250,
              }}
            >
              <p className="measure-info cursor-pointer:onHover">
                <br />
                <h6>
                  <span className="font-bold text-blue-600">
                    Measure Distances and Areas
                  </span>
                </h6>
                <br />
                <hr className="hr-round"></hr>
                <br />
                {element}
              </p>
              <ul className="mousechange leaflet-pointer grid">
                <li>
                  <button
                    id="finishMeasBtn"
                    className="leaflet-pointer w-full rounded border bg-blue-600 p-1 text-white hover:bg-blue-800"
                    title="Finish Measurement"
                    onMouseOver={handleMouseOver}
                    style={{
                      position: 'relative',
                      zIndex: isHovering ? 900 : 10,
                    }}
                    onClick={(e) => changeMeasureMode('closed')(e)}
                  >
                    <FontAwesomeIcon icon={faCircleCheck} /> Finish Measurement
                  </button>
                </li>
                <li>
                  <br />
                </li>
                <li>
                  <button
                    id="cancelMeasBtn"
                    className="leaflet-poiner w-full rounded border bg-white p-1 text-primary-600 hover:bg-gray-100"
                    title="Cancel Measurement"
                    onMouseOver={handleMouseOver}
                    style={{
                      position: 'relative',
                      zIndex: isHovering ? 900 : 10,
                    }}
                    onClick={(e) => changeMeasureMode('closed')(e)}
                  >
                    <FontAwesomeIcon icon={faCircleXmark} /> Cancel
                  </button>
                </li>
              </ul>
            </div>
          ) : null}
        </Control>

        {/* MEASUREMENT BUTTON - In a separate Control component */}
        <Control position="topright">
          {measureMode === 'closed' ? (
            <div id="measModeClosed">
              <Tippy
                content="Measure Distances and Areas"
                placement="left-start"
                theme="mapBtnTT"
              >
                <button
                  id="openMeasBtn"
                  className="openMeasBtn rounded"
                  aria-label="Open Measurement"
                  onDragEnd={() => setCursor('pointer')}
                  onMouseOver={handleMouseOver}
                  style={{
                    position: 'relative',
                    zIndex: isHovering ? 900 : 10,
                    border: '0px solid rgba(0,0,0,0.2)',
                    backgroundClip: 'padding-box',
                    width: 42,
                    height: 42,
                  }}
                  onClick={(e) => changeMeasureMode('open')(e)}
                >
                  <FontAwesomeIcon
                    icon={faRulerCombined}
                    size="2xl"
                    color="#FFFFFF"
                  />
                </button>
              </Tippy>
            </div>
          ) : null}
          {measureMode === 'cancelled' ? (
            <Tippy content="Measure Distances and Areas" placement="left-start">
              <button
                id="measBtn"
                className="measBtn rounded"
                aria-label="Open Measurement"
                onDragEnd={() => setCursor('pointer')}
                onMouseOver={handleMouseOver}
                style={{
                  position: 'relative',
                  zIndex: isHovering ? 900 : 10,
                  border: '0px solid rgba(0,0,0,0.2)',
                  backgroundClip: 'padding-box',
                  width: 42,
                  height: 42,
                }}
                onClick={(e) => changeMeasureMode('closed')(e)}
              >
                <FontAwesomeIcon
                  icon={faRulerCombined}
                  size="2xl"
                  color="#FFFFFF"
                />
              </button>
            </Tippy>
          ) : null}
        </Control>
        {showVehicleColorsModal && (
          <VehicleColorsModal
            isOpen={showVehicleColorsModal}
            onClose={() => setShowVehicleColorsModal(false)}
            anchorPosition={modalPosition}
            trackedVehicles={(trackedVehicles || []).map(
              // If trackedVehicles is array of objects with name property:
              (vehicle) =>
                typeof vehicle === 'string' ? vehicle : vehicle.name
            )}
          />
        )}
        <MeasureEvents />
        {/* {showVehicleColorsModal && (
          <VehicleColorsModal
            isOpen={showVehicleColorsModal}
            onClose={() => setShowVehicleColorsModal(false)}
            anchorPosition={modalPosition}
            trackedVehicles={(trackedVehicles || []).map(
              (vehicle) => vehicle.name
            )}
          />
        )} */}
      </MapContainer>
    )
  }
)

Map.displayName = 'Map.Map'

export default Map
