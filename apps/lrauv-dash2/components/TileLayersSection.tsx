import React from 'react'
import { faLayerGroup } from '@fortawesome/free-solid-svg-icons'
import { TreeItem } from './MapLayersTreeItem'

interface TileLayerItem {
  name: string
  urlTemplate?: string
  wms?: boolean
  legendurl?: string
  options?: Record<string, unknown>
}

const getLegendUrl = (tile: TileLayerItem): string | undefined => {
  if (tile.legendurl) return tile.legendurl
  if (tile.wms && tile.urlTemplate) {
    const base = tile.urlTemplate.replace(/\?$/, '')
    const layers = String(tile.options?.layers ?? '')
    if (!layers.trim()) return undefined
    const version = String(tile.options?.version ?? '1.1.1')
    return (
      `${base}?SERVICE=WMS&REQUEST=GetLegendGraphic` +
      `&VERSION=${encodeURIComponent(version)}` +
      `&FORMAT=image%2Fpng` +
      `&LAYER=${encodeURIComponent(layers)}`
    )
  }
  return undefined
}

const TileLegendPopup: React.FC<{ tile: TileLayerItem }> = ({ tile }) => {
  const url = getLegendUrl(tile)
  if (!url) return null
  return (
    <div className="max-w-xs rounded bg-white p-2 shadow-lg">
      <p className="mb-1 text-xs font-semibold text-gray-700">{tile.name}</p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={`${tile.name} legend`}
        className="max-w-full"
        onError={(e) => {
          ;(e.currentTarget as HTMLImageElement).style.display = 'none'
        }}
      />
    </div>
  )
}

interface TileLayersSectionProps {
  isFiltering: boolean
  filteredTileLayers: TileLayerItem[]
  tileLayers: TileLayerItem[] | undefined
  selectedTileLayers: string[]
  expandedSections: { tileLayers: boolean }
  toggleExpanded: (section: 'tileLayers') => void
  setSelectedTileLayers: (
    updater: string[] | ((prev: string[]) => string[])
  ) => void
}

export const TileLayersSection: React.FC<TileLayersSectionProps> = ({
  isFiltering,
  filteredTileLayers,
  tileLayers,
  selectedTileLayers,
  expandedSections,
  toggleExpanded,
  setSelectedTileLayers,
}) => {
  if (isFiltering && filteredTileLayers.length === 0) return null

  const renderableTileLayers = (tileLayers ?? []).filter(
    (t) =>
      t.urlTemplate &&
      t.urlTemplate.trim() !== '' &&
      (!t.wms || String(t.options?.layers ?? '').trim() !== '')
  )
  const renderableNames = renderableTileLayers.map((t) => t.name)
  const allTilesSelected =
    renderableNames.length > 0 &&
    renderableNames.every((n) => selectedTileLayers.includes(n))

  return (
    <TreeItem
      label="TILE Layers"
      isExpanded={expandedSections.tileLayers}
      isChecked={allTilesSelected}
      onToggleExpand={() => toggleExpanded('tileLayers')}
      onToggleCheck={
        renderableNames.length > 0
          ? () => {
              if (allTilesSelected) {
                setSelectedTileLayers([])
              } else {
                setSelectedTileLayers(renderableNames)
              }
            }
          : undefined
      }
      disabled={(tileLayers?.length ?? 0) === 0}
      icon={faLayerGroup}
      iconColor="#0ea5e9"
    >
      {filteredTileLayers.map((tile) => {
        const hasValidUrl = !!(
          tile.urlTemplate &&
          tile.urlTemplate.trim() !== '' &&
          (!tile.wms || String(tile.options?.layers ?? '').trim() !== '')
        )
        const disabledTitle = !tile.urlTemplate?.trim()
          ? 'Layer has no URL configured'
          : tile.wms && !String(tile.options?.layers ?? '').trim()
          ? 'WMS layer has no layers configured'
          : undefined
        const legendUrl = getLegendUrl(tile)
        return (
          <TreeItem
            key={`tile-${tile.name}`}
            label={tile.name}
            isChecked={selectedTileLayers.includes(tile.name)}
            onToggleCheck={
              hasValidUrl
                ? () => {
                    setSelectedTileLayers((prev) =>
                      prev.includes(tile.name)
                        ? prev.filter((n) => n !== tile.name)
                        : [...prev, tile.name]
                    )
                  }
                : undefined
            }
            disabled={!hasValidUrl}
            disabledTitle={disabledTitle}
            legendContent={
              legendUrl !== undefined ? (
                <TileLegendPopup tile={tile} />
              ) : undefined
            }
          />
        )
      })}
      {tileLayers !== undefined && tileLayers.length === 0 ? (
        <div className="py-2 pl-10 text-sm italic text-gray-500">
          No tile layers available
        </div>
      ) : null}
    </TreeItem>
  )
}
