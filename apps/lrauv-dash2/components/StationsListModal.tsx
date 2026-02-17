import React, { useCallback } from 'react'
import { useStations } from '@mbari/api-client'
import { Modal } from '@mbari/react-ui'
import { StationSection } from './StationSection'
import { useSelectedStations } from './SelectedStationContext'
import { createLogger } from '@mbari/utils'

const logger = createLogger('StationsListModal')

export const StationsListModal: React.FC<{ onClose: () => void }> = ({
  onClose,
  ...modalProps
}) => {
  logger.debug('StationsListModal rendering')
  const { data: stations } = useStations()
  const { selectedStations, setSelectedStations } = useSelectedStations()

  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

  const handleSelectAll = useCallback(() => {
    if (stations) {
      setSelectedStations(
        stations.map((station) => ({
          name: station.name,
          geojson: station.geojson,
          lat: station.geojson.geometry.coordinates[1],
          lon: station.geojson.geometry.coordinates[0],
        }))
      )
    }
  }, [stations, setSelectedStations])

  const handleDeselectAll = useCallback(() => {
    setSelectedStations([])
  }, [setSelectedStations])

  const handleToggleSelectAll = useCallback(() => {
    if (selectedStations.length === stations?.length) {
      handleDeselectAll()
    } else {
      handleSelectAll()
    }
  }, [selectedStations, stations, handleSelectAll, handleDeselectAll])

  const groups =
    stations?.reduce((acc, station) => {
      // Ensure we have a valid name to use as a group key
      const groupName = station.name || String(station)
      // Initialize the group array if it doesn't exist
      const group = acc[groupName] || []
      logger.debug('groupName:', groupName)
      logger.debug('group:', group)
      // Add the complete station object to the group
      group.push(station)
      // Update the accumulator
      return { ...acc, [groupName]: group }
    }, {} as Record<string, any[]>) ?? {}

  return (
    <Modal
      title={
        <div>
          <div className="md text-align-center font-italic bg-white text-sm text-gray-400">
            <i>Select the positions/layers to display</i>
            <br />
            <br />
            <br />
          </div>
          <div className="flex items-center justify-between">
            <div className="stations text-align-center bg-white text-lg font-bold underline">
              STATIONS
            </div>
            <label className="items-right flex cursor-pointer">
              <span>Select All</span>
              <input
                type="checkbox"
                className="ml-2"
                checked={selectedStations.length === stations?.length}
                onChange={handleToggleSelectAll}
              />
            </label>
          </div>
        </div>
      }
      confirmButtonText="Close"
      onClose={onClose}
      snapTo="top-left"
      open
      onConfirm={handleClose}
      style={{ top: 510, background: '#ffffff', color: 'black' }}
    >
      <ul
        className="mb-2 flex flex-col overflow-auto"
        style={{
          height: '450px',
          overflowY: 'auto',
          width: 'auto',
          background: '#e3f2fd',
          paddingBottom: '10px',
          paddingTop: '10px',
        }}
      >
        {Object.keys(groups)?.map((groupName) => (
          <li key={groupName}>
            <StationSection name={groupName} items={groups[groupName]} />
          </li>
        ))}
      </ul>
    </Modal>
  )
}
