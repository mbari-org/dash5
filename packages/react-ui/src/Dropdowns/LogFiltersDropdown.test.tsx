import React from 'react'
import { render, screen, fireEvent, within } from '@testing-library/react'
import '@testing-library/jest-dom'
import {
  LogFiltersDropdown,
  LogFiltersDropdownProps,
} from './LogFiltersDropdown'

const OPTIONS = [
  { id: 'argoReceive', label: 'argoReceive' },
  { id: 'command', label: 'command' },
  { id: 'dataProcessed', label: 'dataProcessed' },
]

const getProps = (
  overrides: Partial<LogFiltersDropdownProps> = {}
): LogFiltersDropdownProps => ({
  options: OPTIONS,
  selectedIds: [],
  onChange: () => undefined,
  searchValue: '',
  onSearchChange: () => undefined,
  onDismiss: () => undefined,
  ...overrides,
})

test('should render the component', async () => {
  const props = getProps()
  expect(() => render(<LogFiltersDropdown {...props} />)).not.toThrow()
})

test('should render search input and call onSearchChange', async () => {
  const onSearchChange = jest.fn()
  const props = getProps({ onSearchChange })
  render(<LogFiltersDropdown {...props} />)

  const input = screen.getByLabelText('search') as HTMLInputElement
  expect(input).toBeInTheDocument()
  expect(input.placeholder).toBe('Search')

  fireEvent.change(input, { target: { value: 'comm' } })
  expect(onSearchChange).toHaveBeenCalledWith('comm')
})

test('should reflect selectedIds and show checked state', async () => {
  const props = getProps({ selectedIds: ['command'] })
  render(<LogFiltersDropdown {...props} />)

  const allCheckbox = screen.getAllByRole('checkbox')[0]
  expect(allCheckbox).not.toBeChecked()

  const option0 = screen.getByTestId('logfilters-option-0')
  const option1 = screen.getByTestId('logfilters-option-1')
  const option2 = screen.getByTestId('logfilters-option-2')

  expect(within(option0).getByRole('checkbox')).not.toBeChecked()
  expect(within(option1).getByRole('checkbox')).toBeChecked()
  expect(within(option2).getByRole('checkbox')).not.toBeChecked()
})

test('should toggle a single option and call onChange', async () => {
  const onChange = jest.fn()
  const props = getProps({ onChange })
  render(<LogFiltersDropdown {...props} />)

  const option1Button = screen.getByLabelText(`option-${OPTIONS[1].id}`)
  fireEvent.click(option1Button)

  expect(onChange).toHaveBeenLastCalledWith([OPTIONS[1].id])
})

test('should check the All checkbox when all options are selected', async () => {
  const allSelected = OPTIONS.map((o) => o.id)
  const props = getProps({ selectedIds: allSelected })
  render(<LogFiltersDropdown {...props} />)

  const allCheckbox = screen.getAllByRole('checkbox')[0]
  expect(allCheckbox).toBeChecked()
})
