import React from 'react'
import { faFileCode } from '@fortawesome/free-solid-svg-icons'
import { TreeItem } from './MapLayersTreeItem'

interface KmlLayerItem {
  name: string
  path: string
}

interface KmlLayersSectionProps {
  isFiltering: boolean
  filteredKmlLayers: KmlLayerItem[]
  kmlLayers: KmlLayerItem[] | undefined
  selectedKmlLayers: string[]
  expandedSections: { kmlLayers: boolean }
  toggleExpanded: (section: 'kmlLayers') => void
  setSelectedKmlLayers: (
    updater: string[] | ((prev: string[]) => string[])
  ) => void
}

export const KmlLayersSection: React.FC<KmlLayersSectionProps> = ({
  isFiltering,
  filteredKmlLayers,
  kmlLayers,
  selectedKmlLayers,
  expandedSections,
  toggleExpanded,
  setSelectedKmlLayers,
}) => {
  if (isFiltering && filteredKmlLayers.length === 0) return null

  const selectableKmlLayers = (kmlLayers ?? []).filter(
    (k) => !k.path.toLowerCase().endsWith('.kmz')
  )
  const selectableNames = selectableKmlLayers.map((k) => k.name)
  const allSelected =
    selectableNames.length > 0 &&
    selectableNames.every((n) => selectedKmlLayers.includes(n))

  return (
    <TreeItem
      label="KML Layers"
      isExpanded={
        isFiltering ? filteredKmlLayers.length > 0 : expandedSections.kmlLayers
      }
      isChecked={allSelected}
      onToggleExpand={() => toggleExpanded('kmlLayers')}
      onToggleCheck={
        selectableNames.length > 0
          ? () => {
              if (allSelected) {
                setSelectedKmlLayers([])
              } else {
                setSelectedKmlLayers(selectableNames)
              }
            }
          : undefined
      }
      disabled={selectableNames.length === 0}
      icon={faFileCode}
      iconColor="#16a34a"
    >
      {filteredKmlLayers.map((kml) => {
        const isKmz = kml.path.toLowerCase().endsWith('.kmz')
        return (
          <TreeItem
            key={`kml-${kml.name}`}
            label={kml.name}
            isChecked={!isKmz && selectedKmlLayers.includes(kml.name)}
            disabled={isKmz}
            disabledTitle=".kmz files are not yet supported"
            onToggleCheck={
              isKmz
                ? undefined
                : () => {
                    setSelectedKmlLayers((prev) =>
                      prev.includes(kml.name)
                        ? prev.filter((n) => n !== kml.name)
                        : [...prev, kml.name]
                    )
                  }
            }
          />
        )
      })}
      {kmlLayers !== undefined && kmlLayers.length === 0 ? (
        <div className="py-2 pl-10 text-sm italic text-gray-500">
          No KML layers available
        </div>
      ) : null}
    </TreeItem>
  )
}
