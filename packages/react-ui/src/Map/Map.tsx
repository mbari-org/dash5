import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import {
  TileLayer,
  MapContainer,
  WMSTileLayer,
  LayersControl,
  ScaleControl,
  useMapEvents,
  useMap,
} from 'react-leaflet'
import ReactLeafletGoogleLayer from 'react-leaflet-google-layer'
import Control from 'react-leaflet-custom-control'
import 'leaflet/dist/leaflet.css'
import 'leaflet-measure/dist/leaflet-measure.css'
import '@mbari/react-ui/dist/mbari-ui.css'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
// import 'react-tooltip/dist/react-tooltip.css'
import MouseCoordinates, { MouseCoordinatesProps } from './MouseCoordinates'
import { useMapBaseLayer, BaseLayerOption } from './useMapBaseLayer'
import 'leaflet-mouse-position'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowsToCircle,
  faCircleCheck,
  faRulerCombined,
  faArrowsUpDownLeftRight,
  faLayerGroup,
} from '@fortawesome/free-solid-svg-icons'
import { faCircleXmark } from '@fortawesome/free-regular-svg-icons'
import { Measurement } from './Measurement'
// Remove the ReactTooltip import and use native tooltips
// import { Tooltip } from 'react-tooltip'
import MovingDot from './MovingDot'
import { AreaComponent, PathComponent, MeasurementProps } from './Measurement'

const regex = /\B(?=(\d{3})+(?!\d))/g
let mapCoord: String
let dmsCoord: String

export interface MapProps {
  className?: string
  style?: React.CSSProperties
  center?: [number, number]
  zoom?: number
  minZoom?: number
  maxZoom?: number
  maxNativeZoom?: number
  scrollWheelZoom?: boolean
  onRequestDepth?: MouseCoordinatesProps['onRequestDepth']
  onRequestCoordinate?: () => void
  onRequestPlatforms?: () => void
  onRequestStations?: () => void
  dmsCoord?: string
  mapCoord?: string
  fitBounds?: [[number, number], [number, number]]
  children?: React.ReactNode
}

export type MeasureMode = 'open' | 'measuring' | 'closed' | 'cancelled'

const CenterView: React.FC<{
  coords: [number, number]
  bounds?: [[number, number], [number, number]]
}> = ({ coords, bounds }) => {
  const map = useMap()

  useEffect(() => {
    if (bounds) {
      console.log('Fitting map to bounds:', bounds)
      map.fitBounds(bounds, { padding: [50, 50] })
    } else if (coords) {
      console.log('Setting map view to coords:', coords)
      map.setView(coords, map.getZoom())
    }
  }, [coords, bounds, map])

  return null
}

const Map: React.FC<MapProps> = ({
  className,
  style,
  center = [36.7849, -122.12097],
  zoom = 17,
  minZoom = 4,
  maxZoom = 17,
  maxNativeZoom = 13,
  fitBounds,
  children,
  onRequestDepth,
  onRequestCoordinate,
  onRequestPlatforms,
  onRequestStations,
}) => {
  const originalCenter = useRef(center)
  const { baseLayer, setBaseLayer } = useMapBaseLayer()
  const addBaseLayerHandler = useCallback(
    (layer: BaseLayerOption) => () => {
      setBaseLayer(layer)
    },
    [setBaseLayer]
  )

  // Create measurements
  const [measurements, setMeasurements] = useState<
    {
      id: string
      editing?: boolean
    }[]
  >([])

  const handleLayersClick = () => {
    // Save current map center so CenterView doesn't change it
    // originalCenter.current = center
    // Call the handler without changing the center
    onRequestStations?.()
  }
  const [count, setCount] = useState(0)
  const [isHovering, setIsHovering] = useState(false)

  const measStyle = {
    color: '#00008b',
    fontFamily: 'Helvetica Neue, Arial, Helvetica, sans- serif',
    fontSize: '12px',
  }

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

    if (mode === 'open') {
      setCount(0)
    }
    if (mode === 'measuring') {
      setCount(0)
      setMeasurements((prev) => [
        ...prev,
        { id: Date.now().toLocaleString(), editing: true },
      ])
    }
    if (mode === 'closed') {
      setCount(0)
      setMeasurements((prev) =>
        prev.map((p) => ({
          ...p,
          editing: false,
        }))
      )
    }
    if (mode === 'cancelled') {
      setCount(0)
      setMeasurements((prev) => [])
    }
    setMeasureMode(mode)
  }

  const handleRequestCoordinate = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('Map.tsx - handleRequestCoordinate')
    onRequestCoordinate?.()
  }

  const handleMouseOver = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setVisibleDot('hidden')
  }

  // removeMeasurement
  const removeMeasurement = useCallback(
    (id: string) => () => {
      setMeasurements((prev) => prev.filter((m) => m.id !== id))
    },
    []
  )

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
    >
      <ScaleControl position="topright" />
      <LayersControl position="topright">
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
        {gmrtLayer}
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
      </LayersControl>
      <Control prepend position="topright">
        <MouseCoordinates onRequestDepth={onRequestDepth} />
      </Control>
      {children}

      {/* COORDINATE CONTROLS - Separate from other controls */}
      {onRequestCoordinate ? (
        <Control position="topleft">
          <Tippy
            content="Center map on centroid of latest GPS Fix positions"
            placement="right-start"
            theme="mapBtnTT"
          >
            <button
              id="vehicle-center"
              className="vehicle-center rounded"
              onMouseOver={handleMouseOver}
              style={{
                position: 'relative',
                zIndex: isHovering ? 900 : 10,
                border: '0px solid rgba(0,0,0,0.2)',
                backgroundClip: 'padding-box',
                width: 42,
                height: 42,
              }}
              onClick={handleRequestCoordinate}
            >
              <FontAwesomeIcon
                icon={faArrowsToCircle}
                size="2xl"
                color="#ffffff"
              />
            </button>
          </Tippy>
          <hr style={{ height: '8pt', visibility: 'hidden' }} />
          <Tippy
            content="Zoom to all available/selected vehicles"
            placement="right-start"
            theme="mapBtnTT"
          >
            <button
              id="allVehicles-center"
              className="allVehicles-center rounded"
              onMouseOver={handleMouseOver}
              style={{
                position: 'relative',
                zIndex: isHovering ? 900 : 10,
                border: '0px solid rgba(0,0,0,0.2)',
                backgroundClip: 'padding-box',
                width: 42,
                height: 42,
              }}
              onClick={handleRequestCoordinate}
            >
              <FontAwesomeIcon
                icon={faArrowsUpDownLeftRight}
                size="2xl"
                color="#ffffff"
              />
            </button>
          </Tippy>
        </Control>
      ) : null}

      {/* TRACKDB/STATIONS CONTROLS - Now in separate Control component */}
      <Control position="topleft">
        <Tippy
          content="Track Database"
          placement="right-start"
          theme="mapBtnTT"
        >
          <button
            id="trackdb"
            className="trackdb rounded"
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
            id="stationsdb"
            className="stationsdb rounded"
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

      {/* CENTER VIEW - Supports both center and bounds */}
      <CenterView coords={originalCenter.current} bounds={fitBounds} />

      {/* MEASUREMENT CONTROLS - In a separate Control component */}
      <Control position="topright">
        {measurements.map((m) => (
          <React.Fragment key={m.id}>
            <Measurement
              editing={m.editing}
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
      <MeasureEvents />
    </MapContainer>
  )
}

Map.displayName = 'Map.Map'

export default Map
