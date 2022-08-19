import React, { useState } from 'react'
import { Modal } from '../Modal/Modal'
import { StepProgress, StepProgressProps } from '../Navigation/StepProgress'
import { SelectOption } from '../Fields/Select'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDoubleRight } from '@fortawesome/pro-solid-svg-icons'
import { MissionTableProps } from '../Tables/MissionTable'
import { MissionStep } from './MissionModalSteps/MissionStep'
import { WaypointProps, WaypointTableProps } from '../Tables/WaypointTable'
import { WaypointStep } from './MissionModalSteps/WaypointStep'
import { ExtraButton } from '../Modal/Footer'

export interface MissionModalProps
  extends Omit<StepProgressProps, 'steps'>,
    MissionTableProps,
    WaypointTableProps {
  className?: string
  style?: React.CSSProperties
  vehicleName: string
  recentRuns?: SelectOption[]
  totalDistance?: string
  bottomDepth?: string
  duration?: string
  onRefreshStats?: () => void
  onSchedule?: () => void
  onCancel?: () => void
}

export const MissionModal: React.FC<MissionModalProps> = ({
  className,
  style,
  currentIndex,
  vehicleName,
  missions,
  recentRuns,
  selectedId,
  waypoints,
  stations,
  totalDistance,
  bottomDepth,
  duration,
  onRefreshStats,
  onSchedule,
  onCancel,
}) => {
  const steps = [
    'Mission',
    'Waypoints',
    'Parameters',
    'Safety & Comms',
    'Review',
    'Schedule',
  ]

  const [currentStep, setCurrentStep] = useState(currentIndex)
  const [selectedMissionId, setSelectedMissionId] =
    useState<string | null | undefined>(selectedId)

  const initialWaypoints = waypoints.map((waypoint) =>
    (waypoint.lat || waypoint.lon) && !waypoint.stationName
      ? { ...waypoint, stationName: 'Custom' }
      : waypoint
  )

  const [updatedWaypoints, setUpdatedWaypoints] =
    useState<WaypointProps[]>(initialWaypoints)

  const handleUpdate = (newWaypoints: WaypointProps[]) => {
    setUpdatedWaypoints(newWaypoints)
  }

  const isLastStep = currentStep === steps.length - 1
  const confirmButtonText = isLastStep ? (
    `Schedule ${vehicleName}`
  ) : (
    <div>
      <span className="pr-2">Next</span>{' '}
      <FontAwesomeIcon icon={faChevronDoubleRight} />
    </div>
  )

  const handleNext = () => {
    return setCurrentStep(currentStep + 1)
  }
  const handlePrevious = () => {
    if (currentStep > 0) {
      return setCurrentStep(currentStep - 1)
    }
  }

  const handleSchedule = () => {
    onSchedule?.()
  }

  const handleSelect = (id?: string | null) => {
    setSelectedMissionId(id)
  }

  const getMissionName = () => {
    const selectedMission = missions.find(({ id }) => id === selectedMissionId)

    return selectedMission?.name ?? ''
  }

  const extraButtons = () => {
    if (currentStep === 0) return []

    const backButton: ExtraButton = {
      buttonText: 'Back',
      appearance: 'secondary',
      onClick: handlePrevious,
    }
    return [backButton]
  }

  const disableConfirm = () => {
    switch (currentStep) {
      case 0:
        return !selectedMissionId
      case 1:
        return !updatedWaypoints.every(
          ({ lat, lon, latName, lonName }) =>
            (Number(lat) || lat === 'NaN') &&
            (Number(lon) || lon === 'NaN') &&
            latName &&
            lonName &&
            lat !== '' &&
            lon !== ''
        )
      default:
        false
    }
  }

  const handleNaNwaypoints = () => {
    const allNaNwaypoints = updatedWaypoints.map((waypoint) => ({
      ...waypoint,
      lat: 'NaN',
      lon: 'NaN',
      stationName: 'Custom',
    }))
    setUpdatedWaypoints(allNaNwaypoints)
  }
  const handleResetWaypoints = () => {
    setUpdatedWaypoints(initialWaypoints)
  }

  const currentModalBody = () => {
    switch (currentStep) {
      case 0:
        return (
          <MissionStep
            vehicleName={vehicleName}
            missions={missions}
            selectedId={selectedMissionId}
            recentRuns={recentRuns}
            onSelect={handleSelect}
          />
        )
      case 1:
        return (
          <WaypointStep
            waypoints={updatedWaypoints}
            stations={stations}
            vehicleName={vehicleName}
            totalDistance={totalDistance}
            bottomDepth={bottomDepth}
            duration={duration}
            mission={getMissionName()}
            onRefreshStats={onRefreshStats}
            onUpdate={handleUpdate}
            onNaNall={handleNaNwaypoints}
            onResetAll={handleResetWaypoints}
          />
        )

      default:
        return <p>Placeholder for {steps[currentStep]} step</p>
    }
  }

  return (
    <Modal
      className={className}
      style={style}
      title={
        <StepProgress
          steps={steps}
          currentIndex={currentStep}
          className="h-[52px] w-[742px]"
        />
      }
      onConfirm={isLastStep ? handleSchedule : handleNext}
      disableConfirm={disableConfirm()}
      onCancel={onCancel}
      confirmButtonText={confirmButtonText}
      extraButtons={extraButtons()}
      extraWideModal
      bodyOverflowHidden
      open
    >
      {currentModalBody()}
    </Modal>
  )
}
