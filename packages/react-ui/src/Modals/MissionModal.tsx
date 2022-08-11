import React, { useState } from 'react'
import { Modal } from '../Modal/Modal'
import { StepProgress, StepProgressProps } from '../Navigation/StepProgress'
import { SelectOption } from '../Fields/Select'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDoubleRight } from '@fortawesome/pro-solid-svg-icons'
import { MissionTableProps } from '../Tables/MissionTable'
import { MissionStep } from './MissionModalSteps/MissionStep'

export interface MissionModalProps
  extends Omit<StepProgressProps, 'steps'>,
    MissionTableProps {
  className?: string
  style?: React.CSSProperties
  vehicleName: string
  recentRuns?: SelectOption[]
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

  const handleSchedule = () => {
    onSchedule?.()
  }

  const handleSelect = (id?: string | null) => {
    setSelectedMissionId(id)
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
      disableConfirm={currentStep === 0 && !selectedMissionId}
      onCancel={onCancel}
      confirmButtonText={confirmButtonText}
      extraWideModal
      bodyOverflowHidden
      open
    >
      {currentModalBody()}
    </Modal>
  )
}
