import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Modal } from '../Modal/Modal'
import { StepProgress, StepProgressProps } from '../Navigation/StepProgress'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDoubleRight } from '@fortawesome/pro-solid-svg-icons'
import { faInfoCircle } from '@fortawesome/pro-regular-svg-icons'
import { IconButton } from '../Navigation'
import { Input, SelectField } from '../Fields'
import {
  Command,
  CommandTable,
  CommandTableProps,
} from '../Tables/CommandTable'
import { SelectOption } from '../Fields/Select'
import { SortDirection } from '../Data/TableHeader'
import { sortByProperty } from '@mbari/utils'
import {
  ScheduleCommandForm,
  ScheduleCommandFormValues,
} from '../Forms/ScheduleCommandForm'
import { AsyncSubmitHandler } from '@sumocreations/forms'
import { ExtraButton } from '../Modal/Footer'

export interface CommandModalProps
  extends StepProgressProps,
    CommandTableProps {
  className?: string
  style?: React.CSSProperties
  vehicleName: string
  onCancel?: () => void
  onSubmit: AsyncSubmitHandler<ScheduleCommandFormValues>
  onAltAddressSubmit?: AsyncSubmitHandler<ScheduleCommandFormValues>
  onMoreInfo?: () => void
  recentCommands?: Command[]
  frequentCommands?: Command[]
}

const filters: SelectOption[] = [
  { name: 'Recent Commands', id: 'recent' },
  { name: 'Frequent Commands', id: 'frequent' },
  { name: 'All Commands', id: 'all' },
]

export const CommandModal: React.FC<CommandModalProps> = ({
  className,
  style,
  steps,
  currentIndex,
  vehicleName,
  commands,
  recentCommands,
  frequentCommands,
  selectedId,
  onCancel,
  onSubmit,
  onAltAddressSubmit,
  onMoreInfo,
}) => {
  const submitButtonRef = useRef<HTMLButtonElement | null>(null)
  const [currentStep, setCurrentStep] = useState(currentIndex)
  const [selectedCommandId, setSelectedCommandId] = useState<
    string | null | undefined
  >(selectedId)
  const [selectedFilter, setSelectedFilter] = useState<
    string | null | undefined
  >('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredCommands, setFilteredCommands] = useState<Command[]>(commands)
  const [sortColumn, setSortColumn] = useState<number | null | undefined>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)

  useEffect(() => {
    if (selectedFilter) {
      setSearchTerm('')
      setSortDirection(null)
      console.log(selectedFilter)
      switch (selectedFilter) {
        case 'recent':
          console.log(recentCommands)
          setFilteredCommands(recentCommands || [])
          break
        case 'frequent':
          console.log(frequentCommands)
          setFilteredCommands(frequentCommands || [])
          break
        default:
          setFilteredCommands(commands)
          break
      }
    }

    if (searchTerm) {
      setSortDirection(null)
      const searchResults = filteredCommands.filter(({ name }) =>
        name.includes(searchTerm)
      )
      setFilteredCommands(searchResults)
    }

    if (!selectedFilter && !searchTerm) {
      setFilteredCommands(commands)
    }
  }, [searchTerm, selectedFilter, commands])

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
    if (selectedCommandId) {
      return setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      return setCurrentStep(currentStep - 1)
    }
  }

  const handleSelectRecent = (id: string | null) => {
    if (!id) {
      setSelectedCommandId(null)
    }
    setSearchTerm('')
    setSelectedFilter(id)
  }

  const handleSearch = (term: string) => {
    if (selectedFilter || selectedCommandId) {
      setSelectedCommandId(null)
      setSelectedFilter(null)
    }
    setSearchTerm(term)
  }

  const getCommandNameById = (id: string) => {
    const selectedCommand = commands.find((command) => command.id === id)
    return selectedCommand?.name
  }

  const handleSort = (column: number, isAscending?: boolean) => {
    const sortableColumns: string[] = ['name', 'vehicle', 'description']
    const sortProperty = sortableColumns[column] as keyof Command
    const updatedIsAscending = !isAscending

    const sortedCommands = sortByProperty({
      arrOfObj: [...filteredCommands],
      sortProperty,
      secondarySort: 'name',
      sortAscending: updatedIsAscending,
    })
    setSortColumn(column)
    setSortDirection(updatedIsAscending ? 'asc' : 'desc')
    setFilteredCommands(sortedCommands as Command[])
  }

  const [shouldUseAltAddress, setShouldUseAltAddress] = useState(false)
  const extraButtons = () => {
    if (currentStep === 0) return []

    const backButton: ExtraButton = {
      buttonText: 'Back',
      appearance: 'secondary',
      onClick: handlePrevious,
    }
    const altAddressButton: ExtraButton = {
      buttonText: 'Submit to alternative address',
      appearance: 'secondary',
      type: 'submit',
      onClick: () => {
        if (submitButtonRef.current) {
          setShouldUseAltAddress(true)
          submitButtonRef.current.click()
        }
      },
    }

    return isLastStep && onAltAddressSubmit
      ? [backButton, altAddressButton]
      : [backButton]
  }

  const handleScheduleSubmit: CommandModalProps['onSubmit'] = useCallback(
    async (values) => {
      if (shouldUseAltAddress) {
        setShouldUseAltAddress(false)
        return await onAltAddressSubmit?.(values)
      }
      return onSubmit(values)
    },
    [shouldUseAltAddress, onAltAddressSubmit, onSubmit]
  )

  return (
    <Modal
      className={className}
      style={style}
      title={
        <StepProgress
          steps={steps}
          currentIndex={currentStep}
          className="h-[52px] w-[512px]"
        />
      }
      onConfirm={isLastStep ? null : handleNext}
      onCancel={onCancel}
      confirmButtonText={confirmButtonText}
      extraButtons={extraButtons()}
      extraWideModal
      bodyOverflowHidden
      form={isLastStep ? 'scheduleCommandForm' : undefined}
      open
    >
      {currentStep === 0 && (
        <section className="h-full">
          <ul className="grid grid-cols-5 pb-2">
            <li className="col-span-2 self-center">
              Select a command for{' '}
              <span className="text-teal-500" data-testid="vehicle name">
                {vehicleName}
              </span>
              <IconButton
                icon={faInfoCircle}
                ariaLabel="More info"
                onClick={onMoreInfo}
              />
            </li>
            <li className="col-span-3 flex items-center">
              <SelectField
                name="Recent commands"
                placeholder="Recent Commands"
                options={filters}
                value={selectedFilter ?? undefined}
                onSelect={(id) => handleSelectRecent(id)}
                clearable
              />
              <Input
                name="Search commands field"
                placeholder="Search commands"
                className="ml-2 h-full flex-grow"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </li>
          </ul>

          <CommandTable
            commands={filteredCommands}
            selectedId={selectedCommandId ? selectedCommandId : ''}
            onSelectCommand={setSelectedCommandId}
            onSortColumn={handleSort}
            // calculated max height provides responsive table size without clipping inside modal
            className="max-h-[calc(100%-40px)]"
            activeSortColumn={sortColumn}
            sortDirection={sortDirection}
          />
        </section>
      )}
      {currentStep === 1 && (
        <p className="mt-4 text-[50px] text-stone-400/80">
          Placeholder for future steps
        </p>
      )}
      {currentStep === 2 && selectedCommandId && (
        <ScheduleCommandForm
          vehicleName={vehicleName}
          command={getCommandNameById(selectedCommandId) ?? ''}
          onSubmit={handleScheduleSubmit}
          id="scheduleCommandForm"
          ref={submitButtonRef}
        />
      )}
    </Modal>
  )
}

CommandModal.displayName = 'Modals.CommandModal'
