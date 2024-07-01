import {
  TileLayer,
  MapContainer,
  WMSTileLayer,
  LayersControl,
  ScaleControl,
  useMapEvents,
} from 'react-leaflet'
import Control from 'react-leaflet-custom-control'
import 'leaflet/dist/leaflet.css'
import 'leaflet-measure/dist/leaflet-measure.css'
import '../css/geoManControl.css'
import 'react-tooltip/dist/react-tooltip.css'
import React, { useCallback, useMemo, useState } from 'react'
import Symbology, { SymbologyProps } from './Symbology'
import ReactLeafletGoogleLayer from 'react-leaflet-google-layer'
import MouseCoordinates, { MouseCoordinatesProps } from './MouseCoordinates'
import { useMapBaseLayer, BaseLayerOption } from './useMapBaseLayer'
import 'leaflet-mouse-position'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCircleCheck,
  faRulerCombined,
} from '@fortawesome/free-solid-svg-icons'
import { faCircleXmark } from '@fortawesome/free-regular-svg-icons'
import { Measurement } from './Measurement'
import { Tooltip } from 'react-tooltip'
import { GeomanControl } from './GeomanControl'
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
  dmsCoord?: string
  mapCoord?: string
  children?: React.ReactNode
}

export type MeasureMode = 'open' | 'measuring' | 'closed' | 'cancelled'

const Map: React.FC<MapProps> = ({
  className,
  style,
  center = [36.7849, -122.12097],
  zoom = 17,
  minZoom = 4,
  maxZoom = 17,
  maxNativeZoom = 13,
  children,
  onRequestDepth,
}) => {
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

  const [count, setCount] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const symbols = new Symbology({})

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
  const [tooltipOpen, setTooltipOpen] = useState(false)

  ///////////////////////////////////////////
  //  changeMeasureMode
  const changeMeasureMode = (mode: MeasureMode) => (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // console.log('MeasureMode is set to: ' + mode)
    if (mode === 'open') {
      setCount(0)
    }
    if (mode === 'measuring') {
      setCount(0)
      setMeasurements((prev) => [
        ...prev,
        // { id: measurements.length.toString(), editing: true },
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
      // setMeasureMode('cancelled')
    }
    if (mode === 'cancelled') {
      setCount(0)
      setMeasurements((prev) => [])
    }
    // setCount(0)
    setMeasureMode(mode)
  }

  const HandleMouseOver = () => {
    setVisibleDot('hidden')
  }

  // removeMeasurement
  const removeMeasurement = useCallback(
    (id: string) => () => {
      setMeasurements((prev) => prev.filter((m) => m.id !== id))
      console.log(measurements, id)
    },
    [measurements, setMeasurements]
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
      <div className={'leaflet-control'}>{children}</div>
      <Control position="topright">
        {children}
        {measurements.map((m) => (
          <React.Fragment key={m.id}>
            <Measurement
              editing={m.editing}
              onDelete={removeMeasurement(m.id)}
            />
            <MovingDot editing={m.editing} />
          </React.Fragment>
        ))}
        {measureMode === 'open' ? (
          <div
            className="leaflet-grab rounded bg-white p-2 text-stone-500"
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
                id="createMeas"
                className="mousechange:hover leaflet-grab w-full bg-white p-1 text-primary-600"
                onClick={changeMeasureMode('measuring')}
              >
                <FontAwesomeIcon
                  icon={faCircleCheck}
                  size="lg"
                  id="circleCheck"
                />
                {'    '} Create A New Measurement {'    '}
              </a>
              <button
                onClick={changeMeasureMode('cancelled')}
                className="mousechange:hover cursor-pointer:onHover p-1"
              >
                <FontAwesomeIcon
                  icon={faCircleXmark}
                  size="lg"
                  id="xMark"
                  style={{ marginLeft: '.5rem' }}
                />
              </button>
            </p>
          </div>
        ) : null}
        {measureMode === 'measuring' ? (
          <div
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
                <span className="font-bold text-blue-800">
                  Measure Distances and Areas
                </span>
              </h6>
              <br />
              <hr className="hr-round"></hr>
              <br />
              {element}
            </p>
            <ul className="mousechange leaflet-grab grid">
              <button
                id="finishMeas"
                className="leaflet-grab w-full rounded border bg-blue-600 p-1 text-white hover:bg-blue-800"
                onMouseOver={HandleMouseOver}
                style={{
                  position: 'relative',
                  zIndex: isHovering ? 900 : 10,
                }}
                onClick={changeMeasureMode('closed')}
              >
                <FontAwesomeIcon icon={faCircleCheck} /> Finish Measurement
              </button>
              <br />
              <button
                id="cancelMeas"
                className="leaflet-grab w-full rounded border bg-white p-1 text-primary-600 hover:bg-gray-100"
                onMouseOver={HandleMouseOver}
                style={{
                  position: 'relative',
                  zIndex: isHovering ? 900 : 10,
                }}
                onClick={changeMeasureMode('cancelled')}
              >
                <FontAwesomeIcon icon={faCircleXmark} /> Cancel
              </button>
            </ul>
          </div>
        ) : null}
        {measureMode === 'closed' ? (
          <button
            className="mousechange rounded bg-white p-2 text-stone-500"
            onDragEnd={() => setCursor('default')}
            style={{
              border: '2px solid rgba(0,0,0,0.2)',
              backgroundClip: 'padding-box',
              width: 48,
            }}
            onClick={changeMeasureMode('open')}
          >
            <a
              data-tooltip-id="measure-tooltip"
              data-tooltip-content="Measure Distances and Areas"
              data-tooltip-place="bottom-end"
            >
              <FontAwesomeIcon
                icon={faRulerCombined}
                size="2xl"
                color="#046B04"
              />
            </a>
            <Tooltip
              id="measure-tooltip"
              style={{
                backgroundColor: 'rgb(255,255,255)',
                color: 'blue',
                fontWeight: 'bold',
                fontSize: '12px',
              }}
            ></Tooltip>
          </button>
        ) : null}
        {measureMode === 'cancelled' ? (
          <button
            className="mousechange rounded bg-white p-2 text-stone-500"
            onDragEnd={() => setCursor('default')}
            style={{
              border: '2px solid rgba(0,0,0,0.2)',
              backgroundClip: 'padding-box',
              width: 48,
            }}
            // onClick={changeMeasureMode('open')}
          >
            <a
              data-tooltip-id="measure-tooltip"
              data-tooltip-content="Measure Distances and Areas"
              data-tooltip-place="bottom-end"
            >
              <FontAwesomeIcon
                icon={faRulerCombined}
                size="2xl"
                color="#046B04"
              />
            </a>
            <Tooltip
              id="measure-tooltip"
              style={{
                backgroundColor: 'rgb(255,255,255)',
                color: 'blue',
                fontWeight: 'bold',
                fontSize: '12px',
              }}
            ></Tooltip>
          </button>
        ) : null}
      </Control>
      <MeasureEvents />
      <GeomanControl position="topleft" drawCircle={true} oneBlock={true} />
    </MapContainer>
  )
}

Map.displayName = 'Map.Map'

export default Map
