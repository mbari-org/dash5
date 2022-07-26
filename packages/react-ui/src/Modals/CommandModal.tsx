import React, { useState } from 'react'
import { Modal } from '../Modal/Modal'
import { StepProgress, StepProgressProps } from '../Navigation/StepProgress'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDoubleRight } from '@fortawesome/pro-solid-svg-icons'
import { faInfoCircle } from '@fortawesome/pro-regular-svg-icons'
import { IconButton } from '../Navigation'
import { Input, SelectField } from '../Fields'
import { CommandTable, CommandTableProps } from '../Tables/CommandTable'

export interface CommandModalProps
  extends StepProgressProps,
    CommandTableProps {
  className?: string
  style?: React.CSSProperties
  vehicleName: string
}

export const CommandModal: React.FC<CommandModalProps> = ({
  className,
  style,
  steps,
  currentIndex,
  vehicleName,
  commands,
  selectedId,
  onSortColumn,
}) => {
  const [selectedCommand, setSelectedCommand] = useState(selectedId)
  const [currentStep, setCurrentStep] = useState(currentIndex)
  const lastStep = steps.length - 1
  const confirmButtonText =
    currentStep === lastStep ? (
      'Submit'
    ) : (
      <div>
        <span className="pr-2">Next</span>{' '}
        <FontAwesomeIcon icon={faChevronDoubleRight} />
      </div>
    )

  const handleCancel = () => {
    setCurrentStep(0)
    setSelectedCommand(selectedId)
  }

  return (
    <Modal
      className={className}
      style={style}
      title={
        <StepProgress
          steps={steps}
          currentIndex={currentStep}
          className="w-3/4"
        />
      }
      onConfirm={() =>
        currentStep === lastStep
          ? console.log('submitted')
          : setCurrentStep(currentStep + 1)
      }
      onCancel={handleCancel}
      confirmButtonText={confirmButtonText}
      extraWideModal
      bodyOverflowHidden
      open
    >
      <ul className="grid grid-cols-5 pb-2">
        <li className="col-span-2 self-center">
          Select a command for{' '}
          <span className=" text-teal-500">{vehicleName}</span>
          <IconButton icon={faInfoCircle} ariaLabel="More info" />
        </li>
        <li className="col-span-3 flex items-center">
          <SelectField name="Recent commands" placeholder="Recent Commands" />
          <Input
            name="Search commands field"
            placeholder="Search commands"
            className="ml-2 h-full flex-grow"
          />
        </li>
      </ul>
      {currentStep === 0 && (
        <CommandTable
          commands={commands}
          selectedId={selectedCommand}
          onSelectCommand={setSelectedCommand}
          onSortColumn={onSortColumn}
          className="h-5/6 xl:h-[89%]"
        />
      )}
      {currentStep !== 0 && (
        <p className="mt-4 text-[50px] text-stone-400/80">
          Placeholder for future steps
        </p>
      )}
    </Modal>
  )
}

CommandModal.displayName = 'Modals.CommandModal'
