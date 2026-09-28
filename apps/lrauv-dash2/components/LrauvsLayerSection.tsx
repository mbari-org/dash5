import React from 'react'
import { faRoute } from '@fortawesome/free-solid-svg-icons'
import { TreeItem } from './MapLayersTreeItem'
import {
  DEFAULT_LEAF_STATE,
  VehicleLeafKey,
  useSelectedLrauvs,
} from './SelectedLrauvsContext'

type SectionName = string

interface LrauvsLayerSectionProps {
  vehicleNames: string[]
  filteredVehicleNames: string[]
  isFiltering: boolean
  expandedSections: Record<string, boolean>
  toggleExpanded: (section: SectionName) => void
}

const LEAF_LABELS: Record<VehicleLeafKey, string> = {
  gpsFixes: 'GPS fixes',
  waypoints: 'Waypoints',
  argos: 'Argos',
  reachedWaypoints: 'Reached WPs',
  emergencies: 'Emergencies',
}

// Leaves that are always shown; Argos is hidden when count is 0
const ORDERED_LEAVES: VehicleLeafKey[] = [
  'gpsFixes',
  'waypoints',
  'reachedWaypoints',
  'emergencies',
  'argos',
]

export const LrauvsLayerSection: React.FC<LrauvsLayerSectionProps> = ({
  vehicleNames,
  filteredVehicleNames,
  isFiltering,
  expandedSections,
  toggleExpanded,
}) => {
  const { isLeafChecked, toggleLeaf, toggleVehicle, toggleAll, vehicleCounts } =
    useSelectedLrauvs()

  if (isFiltering && filteredVehicleNames.length === 0) return null

  const allVehiclesAllOn =
    vehicleNames.length > 0 &&
    vehicleNames.every((vn) => {
      const counts = vehicleCounts[vn]
      const leaves = ORDERED_LEAVES.filter(
        (leaf) => leaf !== 'argos' || (counts?.argos ?? 0) > 0
      )
      return leaves.every((leaf) => isLeafChecked(vn, leaf))
    })

  return (
    <TreeItem
      label="LRAUVs"
      isExpanded={expandedSections.lrauvs}
      isChecked={allVehiclesAllOn}
      onToggleExpand={() => toggleExpanded('lrauvs')}
      onToggleCheck={
        vehicleNames.length > 0 ? () => toggleAll(vehicleNames) : undefined
      }
      icon={faRoute}
      iconColor="#60a5fa"
      disabled={vehicleNames.length === 0}
    >
      {filteredVehicleNames.map((vehicleName) => {
        const counts = vehicleCounts[vehicleName]
        const allLeavesOn = ORDERED_LEAVES.filter(
          (leaf) => leaf !== 'argos' || (counts?.argos ?? 0) > 0
        ).every((leaf) => isLeafChecked(vehicleName, leaf))

        const leafState = vehicleNames.includes(vehicleName)
          ? undefined
          : DEFAULT_LEAF_STATE

        return (
          <TreeItem
            key={`lrauv-${vehicleName}`}
            label={vehicleName}
            isExpanded={expandedSections[`lrauv-${vehicleName}`] ?? true}
            isChecked={allLeavesOn}
            onToggleExpand={() => toggleExpanded(`lrauv-${vehicleName}`)}
            onToggleCheck={() => toggleVehicle(vehicleName)}
          >
            {ORDERED_LEAVES.map((leaf) => {
              const count = counts?.[leaf as keyof typeof counts]
              // Hide Argos leaf entirely when there are no argos points
              if (leaf === 'argos' && (count ?? 0) === 0) return null

              const leafCount =
                leaf !== 'waypoints' && count !== undefined ? ` (${count})` : ''
              const label = `${LEAF_LABELS[leaf]}${leafCount}`
              const checked = leafState
                ? DEFAULT_LEAF_STATE[leaf]
                : isLeafChecked(vehicleName, leaf)

              return (
                <TreeItem
                  key={`lrauv-${vehicleName}-${leaf}`}
                  label={label}
                  isChecked={checked}
                  onToggleCheck={() => toggleLeaf(vehicleName, leaf)}
                />
              )
            })}
          </TreeItem>
        )
      })}
      {vehicleNames.length === 0 && (
        <div className="py-2 pl-10 text-sm italic text-gray-500">
          No vehicles being tracked
        </div>
      )}
    </TreeItem>
  )
}
