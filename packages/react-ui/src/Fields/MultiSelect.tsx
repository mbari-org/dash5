import React from 'react'
import ReactSelect, { MultiValue } from 'react-select'
import { SelectOption } from './Select'

export interface MultiSelectProps {
  id?: string
  name: string
  placeholder?: string
  options?: SelectOption[]
  onChange?: (value: string) => void
  onSelect?: (selection: MultiValue<SelectOption> | null) => void
  value?: MultiValue<SelectOption>
  disabled?: boolean
  clearable?: boolean
  closeMenuOnSelect?: boolean
}

export const MultiSelect = React.forwardRef<any, MultiSelectProps>(
  (
    {
      id,
      name,
      placeholder,
      options = [],
      onChange: handleOnInputChange,
      onSelect: handleSelect,
      value,
      disabled,
      clearable,
      closeMenuOnSelect,
    },
    ref
  ) => {
    const handleChange = (s: MultiValue<SelectOption> | null = null) => {
      handleSelect?.(s)
    }
    return (
      <div className="flex h-full w-full flex-grow">
        <ReactSelect
          name={name}
          options={options}
          value={value}
          defaultValue={value}
          getOptionLabel={(option: SelectOption) => option.name}
          getOptionValue={(option: SelectOption) => option.id}
          placeholder={placeholder}
          className="client__multi__select_container w-full"
          classNamePrefix="client__multi__select"
          onInputChange={handleOnInputChange}
          isClearable={clearable}
          isDisabled={disabled}
          onChange={handleChange}
          styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
          menuPortalTarget={document.body}
          closeMenuOnSelect={closeMenuOnSelect}
          isMulti
        />
        <input type="hidden" ref={ref} name={name} id={id} />
      </div>
    )
  }
)

MultiSelect.displayName = 'Fields.MultiSelect'
