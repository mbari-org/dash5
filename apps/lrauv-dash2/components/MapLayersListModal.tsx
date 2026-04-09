import React from 'react'
import { Modal } from '@mbari/react-ui'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { useMapLayersModal } from './useMapLayersModal'
import { MarkersLayerSection } from './MarkersLayerSection'
import { StationsLayerSection } from './StationsLayerSection'
import { PolygonsLayerSection } from './PolygonsLayerSection'
import { TileLayersSection } from './TileLayersSection'
import { KmlLayersSection } from './KmlLayersSection'

export const MapLayersListModal: React.FC<{
  onClose: () => void
  anchorPosition?: { top: number; left: number }
}> = ({ onClose, anchorPosition }) => {
  const {
    modalRef,
    dialogRef,
    modalPosition,
    isFadingOut,
    expandedSections,
    handleClose,
    toggleExpanded,
    searchQuery,
    setSearchQuery,
    showSelectedOnly,
    setShowSelectedOnly,
    isFiltering,
    stations,
    filteredStations,
    validStations,
    selectedStations,
    setSelectedStations,
    starredSet,
    toggleStarStation,
    setHighlightedStationName,
    setFlyToRequest,
    handleToggleSelectAllStations,
    isStationSelected,
    layerMarkers,
    filteredMarkers,
    toggleMarkerVisibility,
    handleToggleSelectAllMarkers,
    polygons,
    filteredPolygons,
    selectedPolygons,
    setSelectedPolygons,
    polygonBoundsMap,
    tileLayers,
    filteredTileLayers,
    selectedTileLayers,
    setSelectedTileLayers,
    kmlLayers,
    filteredKmlLayers,
    selectedKmlLayers,
    setSelectedKmlLayers,
  } = useMapLayersModal({ onClose, anchorPosition })

  return (
    <>
      <div ref={modalRef}>
        <Modal
          title={
            <div>
              <div className="text-center text-xl font-bold">
                Select the map layers to display
              </div>
              <br />
            </div>
          }
          onClose={handleClose}
          snapTo={!modalPosition ? 'top-left' : undefined}
          open
          allowPointerEventsOnChildren
          fullWidthBody={true}
          style={{
            maxHeight: '70vh',
            background: '#ffffff',
            color: 'blue',
            position: modalPosition ? 'fixed' : undefined,
            top: modalPosition ? `${modalPosition.top}px` : undefined,
            left: modalPosition ? `${modalPosition.left}px` : undefined,
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            width: 'auto',
            minWidth: '420px',
            paddingBottom: '0px',
            paddingTop: '10px',
            opacity: isFadingOut ? 0 : 1,
            pointerEvents: isFadingOut ? 'none' : 'auto',
            transition: 'opacity 0.25s ease-out',
            marginBottom: '0px',
            marginTop: '0px',
          }}
          className="m-0 p-0"
        >
          {/* Invisible inner anchor for getBoundingClientRect */}
          <div
            ref={dialogRef}
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
          />
          {/* Search & filter bar */}
          <div className="flex items-center gap-4 bg-white px-2 pb-2">
            <div className="relative w-44">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Filter layers"
                placeholder="Filter layers..."
                className="w-full rounded border border-gray-300 py-2 pl-3 pr-6 text-base text-gray-900"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  <FontAwesomeIcon
                    icon={faXmark}
                    style={{ fontSize: '12px' }}
                  />
                </button>
              )}
            </div>
            <label className="flex cursor-pointer items-center gap-1.5 whitespace-nowrap text-base text-gray-700">
              <input
                type="checkbox"
                checked={showSelectedOnly}
                onChange={(e) => setShowSelectedOnly(e.target.checked)}
                className="h-5 w-5 cursor-pointer accent-blue-600"
              />{' '}
              <span className="ml-1">Only display selected</span>
            </label>
          </div>
          <div
            className="custom-scrollbar flex-grow"
            style={{
              overflowY: 'auto',
              background: '#e3f2fd',
              padding: '10px',
              width: '100%',
              margin: '0px 0px 20px 0px',
              borderRadius: '4px',
              minHeight: '0',
              maxHeight: 'calc(70vh - 160px)',
            }}
          >
            <div className="tree-view">
              <MarkersLayerSection
                isFiltering={isFiltering}
                filteredMarkers={filteredMarkers}
                layerMarkers={layerMarkers}
                expandedSections={expandedSections}
                toggleExpanded={toggleExpanded}
                handleToggleSelectAllMarkers={handleToggleSelectAllMarkers}
                toggleMarkerVisibility={toggleMarkerVisibility}
              />
              <StationsLayerSection
                isFiltering={isFiltering}
                filteredStations={filteredStations}
                stations={stations}
                validStations={validStations}
                selectedStations={selectedStations}
                expandedSections={expandedSections}
                starredSet={starredSet}
                isStationSelected={isStationSelected}
                toggleExpanded={toggleExpanded}
                handleToggleSelectAllStations={handleToggleSelectAllStations}
                setSelectedStations={setSelectedStations}
              />
              <PolygonsLayerSection
                isFiltering={isFiltering}
                filteredPolygons={filteredPolygons}
                polygons={polygons}
                selectedPolygons={selectedPolygons}
                expandedSections={expandedSections}
                polygonBoundsMap={polygonBoundsMap}
                toggleExpanded={toggleExpanded}
                setSelectedPolygons={setSelectedPolygons}
                setFlyToRequest={setFlyToRequest}
              />
              <TileLayersSection
                isFiltering={isFiltering}
                filteredTileLayers={filteredTileLayers}
                tileLayers={tileLayers}
                selectedTileLayers={selectedTileLayers}
                expandedSections={expandedSections}
                toggleExpanded={toggleExpanded}
                setSelectedTileLayers={setSelectedTileLayers}
              />
              <KmlLayersSection
                isFiltering={isFiltering}
                filteredKmlLayers={filteredKmlLayers}
                kmlLayers={kmlLayers}
                selectedKmlLayers={selectedKmlLayers}
                expandedSections={expandedSections}
                toggleExpanded={toggleExpanded}
                setSelectedKmlLayers={setSelectedKmlLayers}
              />
              {isFiltering &&
                filteredMarkers.length === 0 &&
                filteredStations.length === 0 &&
                filteredPolygons.length === 0 &&
                filteredTileLayers.length === 0 &&
                filteredKmlLayers.length === 0 && (
                  <div className="py-6 text-center text-sm italic text-gray-500">
                    No layers match your search
                  </div>
                )}
            </div>
          </div>
          {/* Footer */}
          <div
            className="border-t border-gray-200 bg-white"
            style={{
              padding: '8px 0',
              width: 'auto',
              background: '#e3f2fd',
              marginRight: '0px',
              marginLeft: '0px',
              marginBottom: '0',
              borderRadius: '4px',
              flexShrink: 0,
              height: '60px',
            }}
          >
            <div className="flex justify-end pr-3">
              <button
                onClick={handleClose}
                className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-800"
                style={{ marginRight: '20px' }}
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  )
}
