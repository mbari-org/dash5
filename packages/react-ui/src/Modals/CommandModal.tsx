import React, { useEffect, useState } from 'react'
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

export interface CommandModalProps
  extends StepProgressProps,
    CommandTableProps {
  className?: string
  style?: React.CSSProperties
  vehicleName: string
  recentCommands?: SelectOption[]
  onCancel?: () => void
  onSubmit?: () => void
  onMoreInfo?: () => void
}

export const CommandModal: React.FC<CommandModalProps> = ({
  className,
  style,
  steps,
  currentIndex,
  vehicleName,
  commands,
  selectedId,
  recentCommands,
  onCancel,
  onSubmit,
  onMoreInfo,
}) => {
  const [currentStep, setCurrentStep] = useState(currentIndex)
  const [selectedCommandId, setSelectedCommandId] =
    useState<string | null | undefined>(selectedId)
  const [selectedRecentId, setSelectedRecentId] =
    useState<string | null | undefined>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredCommands, setFilteredCommands] = useState<Command[]>(commands)
  const [sortColumn, setSortColumn] = useState<number | null | undefined>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)

  useEffect(() => {
    if (selectedRecentId) {
      setSearchTerm('')
      const filteredByRecent = commands.filter(
        ({ id }) => id === selectedRecentId
      )
      setFilteredCommands(filteredByRecent.length ? filteredByRecent : commands)
    }

    if (searchTerm) {
      const searchResults = commands.filter(({ name }) =>
        name.includes(searchTerm)
      )

      setFilteredCommands(searchResults)
    }

    if (!selectedRecentId && !searchTerm) {
      setFilteredCommands(commands)
    }
  }, [searchTerm, selectedRecentId, commands])

  const isLastStep = currentStep === steps.length - 1
  const confirmButtonText = isLastStep ? (
    'Submit'
  ) : (
    <div>
      <span className="pr-2">Next</span>{' '}
      <FontAwesomeIcon icon={faChevronDoubleRight} />
    </div>
  )

  const handleConfirm = () => {
    if (isLastStep) return onSubmit

    if (selectedCommandId) {
      return setCurrentStep(currentStep + 1)
    }
  }

  const handleSelectRecent = (id: string | null) => {
    if (!id) {
      setSelectedCommandId(null)
    }
    setSearchTerm('')
    setSelectedRecentId(id)
  }

  const handleSearch = (term: string) => {
    if (selectedRecentId || selectedCommandId) {
      setSelectedCommandId(null)
      setSelectedRecentId(null)
    }
    setSearchTerm(term)
  }

  const sortByProperty = ({
    a,
    b,
    sortProperty,
    isAscending,
    column,
  }: {
    a: Command
    b: Command
    sortProperty: keyof Command
    isAscending?: boolean
    column: number
  }) => {
    let elem1 = a[sortProperty] ?? ''
    let elem2 = b[sortProperty] ?? ''
    if (!isAscending) [elem1, elem2] = [elem2, elem1]
    if (elem1 > elem2) return -1
    if (elem1 < elem2) return 1
    // sort commands as a secondary measure to sorting other columns (ie if sorting by vehicle, all commands for vehicle Brizo will be in alphabetical order)
    if (column !== 0) return a.name < b.name ? -1 : 1
    return -1
  }

  const handleSort = (column: number, isAscending?: boolean) => {
    const sortableColumns: string[] = ['name', 'vehicle', 'description']
    const sortProperty = sortableColumns[column] as keyof Command

    const sortedColumn = [...filteredCommands].sort((a, b) =>
      sortByProperty({ a, b, sortProperty, isAscending, column })
    )
    setSortColumn(column)
    setSortDirection(isAscending ? 'desc' : 'asc')
    setFilteredCommands(sortedColumn)
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
      onConfirm={handleConfirm}
      onCancel={onCancel}
      confirmButtonText={confirmButtonText}
      extraWideModal
      bodyOverflowHidden
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
                options={recentCommands}
                value={selectedRecentId ?? undefined}
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
      {currentStep !== 0 && (
        <p className="mt-4 text-[50px] text-stone-400/80">
          Placeholder for future steps
        </p>
      )}
    </Modal>
  )
}

CommandModal.displayName = 'Modals.CommandModal'
