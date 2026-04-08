import { useCallback, useState, useRef, useEffect, useMemo } from 'react'
import {
  useStations,
  usePolygons,
  useTileLayers,
  useKmlLayers,
} from '@mbari/api-client'
import { useSelectedStations } from './SelectedStationContext'
import type { Station } from './SelectedStationContext'
import { useMapCamera } from './MapCameraContext'
import { useSelectedPolygons } from './SelectedPolygonsContext'
import { useSelectedTileLayers } from './SelectedTileLayersContext'
import { useSelectedKmlLayers } from './SelectedKmlLayersContext'
import { useMarkers } from './MarkerContext'

type SectionName =
  | 'stations'
  | 'markers'
  | 'polygons'
  | 'tileLayers'
  | 'kmlLayers'
  | `station-${string}`

const EXPANDED_STORAGE_KEY = 'mapLayersExpandedSections'

export const useMapLayersModal = ({
  onClose,
  anchorPosition,
}: {
  onClose: () => void
  anchorPosition?: { top: number; left: number }
}) => {
  const { data: stations } = useStations()
  const {
    selectedStations,
    setSelectedStations,
    starredStations,
    toggleStarStation,
    setHighlightedStationName,
  } = useSelectedStations()
  const { setFlyToRequest } = useMapCamera()
  const {
    markers,
    toggleMarkerVisibility,
    selectAllMarkers,
    deselectAllMarkers,
  } = useMarkers()
  const { selectedPolygons, setSelectedPolygons } = useSelectedPolygons()
  const { selectedTileLayers, setSelectedTileLayers } = useSelectedTileLayers()
  const { selectedKmlLayers, setSelectedKmlLayers } = useSelectedKmlLayers()
  const { data: polygons } = usePolygons()
  const { data: tileLayers } = useTileLayers()
  const { data: kmlLayers } = useKmlLayers()

  // Memoize polygon bounding boxes — avoids re-walking all GeoJSON coordinates
  // on every render (can be expensive for large datasets like US Shipping Lanes).
  // Note: uses a naive global min/max, which is correct for regional (Pacific/CA)
  // data but will produce incorrect bounds for features that cross the antimeridian
  // (±180° longitude). Acceptable tradeoff for the current product scope.
  const polygonBoundsMap = useMemo(() => {
    const map = new Map<
      string,
      { minLat: number; maxLat: number; minLon: number; maxLon: number } | null
    >()
    ;(polygons ?? []).forEach((polygon) => {
      try {
        let minLat = Infinity,
          maxLat = -Infinity,
          minLon = Infinity,
          maxLon = -Infinity
        const collectCoord = (coord: unknown) => {
          if (
            Array.isArray(coord) &&
            coord.length >= 2 &&
            typeof coord[0] === 'number' &&
            typeof coord[1] === 'number'
          ) {
            minLon = Math.min(minLon, coord[0])
            maxLon = Math.max(maxLon, coord[0])
            minLat = Math.min(minLat, coord[1])
            maxLat = Math.max(maxLat, coord[1])
          } else if (Array.isArray(coord)) {
            coord.forEach(collectCoord)
          }
        }
        ;(polygon.geojson?.features ?? []).forEach((f) =>
          collectCoord(f.geometry?.coordinates)
        )
        map.set(
          polygon.name,
          isFinite(minLat) &&
            isFinite(maxLat) &&
            isFinite(minLon) &&
            isFinite(maxLon)
            ? { minLat, maxLat, minLon, maxLon }
            : null
        )
      } catch {
        map.set(polygon.name, null)
      }
    })
    return map
  }, [polygons])

  const [expandedSections, setExpandedSections] = useState<
    Record<SectionName, boolean>
  >(() => {
    try {
      const stored =
        typeof window !== 'undefined'
          ? localStorage.getItem(EXPANDED_STORAGE_KEY)
          : null
      if (stored) {
        const parsed = JSON.parse(stored)
        if (typeof parsed === 'object' && parsed !== null) {
          return {
            stations: parsed.stations ?? false,
            markers: parsed.markers ?? false,
            polygons: parsed.polygons ?? false,
            tileLayers: parsed.tileLayers ?? false,
            kmlLayers: parsed.kmlLayers ?? false,
          }
        }
      }
    } catch {
      // fall through to defaults
    }
    return {
      stations: false,
      markers: false,
      polygons: false,
      tileLayers: false,
      kmlLayers: false,
    }
  })
  const [modalPosition, setModalPosition] = useState<
    { top: number; left: number } | undefined
  >(anchorPosition)
  const [isFadingOut, setIsFadingOut] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  // Separate ref for the dialog content element — used for getBoundingClientRect
  // measurements. modalRef wraps the fixed-position overlay and would report 0x0;
  // dialogRef points to the actual sized panel inside so position clamping works.
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Ref mirror so event-handler closures always read the latest fading state.
  const isFadingOutRef = useRef(false)
  // Set to true by the closing mousedown so the paired click from the SAME
  // gesture is still consumed (preventing map click-actions on close), then
  // cleared. Subsequent gestures during the fade pass through freely.
  const justClosedRef = useRef(false)
  // Tracked so effect cleanup can remove it if the component unmounts while
  // the mouse is still held down (before mouseup fires).
  const clearJustClosedRef = useRef<(() => void) | null>(null)

  const handleClose = useCallback(() => {
    if (isFadingOutRef.current) return
    isFadingOutRef.current = true
    setIsFadingOut(true)
    setHighlightedStationName(null)
    closeTimerRef.current = setTimeout(() => {
      onClose()
    }, 250)
  }, [onClose, setHighlightedStationName])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    }
  }, [])

  // Click-outside to dismiss
  useEffect(() => {
    const handleOutsideCapture = (e: MouseEvent) => {
      if (justClosedRef.current) {
        justClosedRef.current = false
        e.preventDefault()
        e.stopPropagation()
        return
      }
      if (isFadingOutRef.current) return
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        e.preventDefault()
        e.stopPropagation()
        handleClose()
      }
    }

    const handleOutsideMouseDown = (e: MouseEvent) => {
      if (isFadingOutRef.current) return
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        justClosedRef.current = true
        const clearJustClosed = () => {
          clearJustClosedRef.current = null
          setTimeout(() => {
            justClosedRef.current = false
          }, 0)
        }
        clearJustClosedRef.current = clearJustClosed
        document.addEventListener('mouseup', clearJustClosed, {
          capture: true,
          once: true,
        })
        handleClose()
      }
    }

    document.addEventListener('mousedown', handleOutsideMouseDown, {
      capture: true,
    })
    document.addEventListener('click', handleOutsideCapture, { capture: true })
    return () => {
      document.removeEventListener('mousedown', handleOutsideMouseDown, {
        capture: true,
      })
      document.removeEventListener('click', handleOutsideCapture, {
        capture: true,
      })
      if (clearJustClosedRef.current) {
        document.removeEventListener('mouseup', clearJustClosedRef.current, {
          capture: true,
        })
        clearJustClosedRef.current = null
      }
    }
  }, [handleClose])

  useEffect(() => {
    if (!anchorPosition || !dialogRef.current) return
    const modalRect = dialogRef.current.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const viewportWidth = window.innerWidth
    let { top, left } = anchorPosition
    if (top + modalRect.height > viewportHeight) {
      top = Math.max(10, viewportHeight - modalRect.height - 10)
    }
    if (left + modalRect.width > viewportWidth) {
      left = Math.max(10, viewportWidth - modalRect.width - 10)
    }
    setModalPosition({ top, left })
  }, [anchorPosition])

  const toggleExpanded = useCallback((section: SectionName) => {
    setExpandedSections((prev) => {
      const next = { ...prev, [section]: !prev[section] }
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(EXPANDED_STORAGE_KEY, JSON.stringify(next))
        }
      } catch {
        // storage unavailable — continue without persisting
      }
      return next
    })
  }, [])

  const validStations = useMemo(
    () =>
      (stations ?? []).filter((station) => {
        const coords = station.geojson?.geometry?.coordinates
        return (
          Number.isFinite(coords?.[1] as number) &&
          Number.isFinite(coords?.[0] as number)
        )
      }),
    [stations]
  )

  const handleSelectAllStations = useCallback(() => {
    setSelectedStations(
      validStations.map((station) => ({
        name: station.name,
        geojson: station.geojson,
        lat: station.geojson.geometry.coordinates[1],
        lon: station.geojson.geometry.coordinates[0],
      }))
    )
  }, [validStations, setSelectedStations])

  const handleDeselectAllStations = useCallback(() => {
    setSelectedStations([])
  }, [setSelectedStations])

  const handleToggleSelectAllStations = useCallback(() => {
    const selectedValidCount = selectedStations.filter((s) =>
      validStations.some((v) => v.name === s.name)
    ).length
    if (selectedValidCount === validStations.length) {
      handleDeselectAllStations()
    } else {
      handleSelectAllStations()
    }
  }, [
    selectedStations,
    validStations,
    handleSelectAllStations,
    handleDeselectAllStations,
  ])

  const layerMarkers = useMemo(
    () => markers.filter((marker) => marker.savedToLayer),
    [markers]
  )

  const handleToggleSelectAllMarkers = useCallback(() => {
    const allVisible = layerMarkers.every((marker) => marker.visible !== false)
    layerMarkers.forEach((marker) => {
      const needsToggle = (marker.visible !== false) === allVisible
      if (needsToggle) {
        toggleMarkerVisibility(marker.id.toString())
      }
    })
    if (allVisible) {
      deselectAllMarkers()
    } else {
      selectAllMarkers()
    }
  }, [
    layerMarkers,
    toggleMarkerVisibility,
    selectAllMarkers,
    deselectAllMarkers,
  ])

  const isStationSelected = (stationName: string): boolean =>
    selectedStations.some((s) => s.name === stationName)

  const starredSet = useMemo(
    () => new Set(starredStations ?? []),
    [starredStations]
  )

  const sortedStations = useMemo(() => {
    const list = stations ?? []
    return list
      .map((station, index) => ({ station, index }))
      .sort((a, b) => {
        const aStarred = starredSet.has(a.station.name)
        const bStarred = starredSet.has(b.station.name)
        if (aStarred && bStarred)
          return a.station.name.localeCompare(b.station.name)
        if (aStarred) return -1
        if (bStarred) return 1
        return a.index - b.index
      })
      .map(({ station }) => station)
  }, [stations, starredSet])

  const [searchQuery, setSearchQuery] = useState('')
  const [showSelectedOnly, setShowSelectedOnly] = useState(false)
  const isFiltering = searchQuery.trim() !== '' || showSelectedOnly
  const q = searchQuery.trim().toLowerCase()

  const filteredStations = useMemo(() => {
    let list = sortedStations
    if (showSelectedOnly)
      list = list.filter((s) =>
        selectedStations.some((sel) => sel.name === s.name)
      )
    if (q) list = list.filter((s) => s.name.toLowerCase().includes(q))
    return list
  }, [sortedStations, showSelectedOnly, q, selectedStations])

  const filteredMarkers = useMemo(() => {
    let list = layerMarkers
    if (showSelectedOnly) list = list.filter((m) => m.visible !== false)
    if (q)
      list = list.filter((m) =>
        (m.label || `Marker ${m.id}`).toLowerCase().includes(q)
      )
    return list
  }, [layerMarkers, showSelectedOnly, q])

  const filteredPolygons = useMemo(() => {
    let list = polygons ?? []
    if (showSelectedOnly)
      list = list.filter((p) => selectedPolygons.includes(p.name))
    if (q) list = list.filter((p) => p.name.toLowerCase().includes(q))
    return list
  }, [polygons, showSelectedOnly, q, selectedPolygons])

  const filteredTileLayers = useMemo(() => {
    let list = tileLayers ?? []
    if (showSelectedOnly)
      list = list.filter(
        (t) =>
          t.urlTemplate &&
          t.urlTemplate.trim() !== '' &&
          selectedTileLayers.includes(t.name)
      )
    if (q) list = list.filter((t) => t.name.toLowerCase().includes(q))
    return list
  }, [tileLayers, showSelectedOnly, q, selectedTileLayers])

  const filteredKmlLayers = useMemo(() => {
    let list = kmlLayers ?? []
    if (showSelectedOnly)
      list = list.filter(
        (k) =>
          !k.path.toLowerCase().endsWith('.kmz') &&
          selectedKmlLayers.includes(k.name)
      )
    if (q) list = list.filter((k) => k.name.toLowerCase().includes(q))
    return list
  }, [kmlLayers, showSelectedOnly, q, selectedKmlLayers])

  return {
    // refs
    modalRef,
    dialogRef,
    // modal state
    modalPosition,
    isFadingOut,
    expandedSections,
    handleClose,
    toggleExpanded,
    // search/filter
    searchQuery,
    setSearchQuery,
    showSelectedOnly,
    setShowSelectedOnly,
    isFiltering,
    // stations
    stations,
    sortedStations,
    filteredStations,
    validStations,
    selectedStations,
    setSelectedStations,
    starredSet,
    starredStations,
    toggleStarStation,
    setHighlightedStationName,
    setFlyToRequest,
    handleToggleSelectAllStations,
    isStationSelected,
    // markers
    layerMarkers,
    filteredMarkers,
    toggleMarkerVisibility,
    handleToggleSelectAllMarkers,
    // polygons
    polygons,
    filteredPolygons,
    selectedPolygons,
    setSelectedPolygons,
    polygonBoundsMap,
    // tile layers
    tileLayers,
    filteredTileLayers,
    selectedTileLayers,
    setSelectedTileLayers,
    // kml layers
    kmlLayers,
    filteredKmlLayers,
    selectedKmlLayers,
    setSelectedKmlLayers,
  }
}
