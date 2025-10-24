import React from 'react'
import { Modal, Button } from '@mbari/react-ui'

export interface VehiclePickerModalProps {
  vehicleNames: string[]
  selectedMap: Record<string, boolean>
  onToggle: (name: string) => void
  onSelectAll: () => void
  onClearAll: () => void
  onClose: () => void
}

const VehiclePickerModal: React.FC<VehiclePickerModalProps> = ({
  vehicleNames,
  selectedMap,
  onToggle,
  onSelectAll,
  onClearAll,
  onClose,
}) => {
  return (
    <Modal
      title={<div className="text-lg font-bold">Select Vehicles</div>}
      onClose={onClose}
      onConfirm={onClose}
      confirmButtonText="Done"
      open
      style={{ minWidth: 600 }}
      blurBackground
    >
      <article className="flex flex-col gap-3">
        <section className="flex gap-2">
          <Button
            appearance="secondary"
            aria-label="Select all vehicles"
            onClick={onSelectAll}
          >
            Select all
          </Button>
          <Button
            appearance="secondary"
            aria-label="Clear all vehicles"
            onClick={onClearAll}
          >
            Clear all
          </Button>
        </section>
        <section className="overflow-auto rounded border p-2">
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
            {vehicleNames.map((name) => (
              <li key={name} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={Boolean(selectedMap[name])}
                  onChange={() => onToggle(name)}
                  aria-label={`Select ${name}`}
                />
                <span>{name}</span>
              </li>
            ))}
          </ul>
        </section>
      </article>
    </Modal>
  )
}

export default VehiclePickerModal
