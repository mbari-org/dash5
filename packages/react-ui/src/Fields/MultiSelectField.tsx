import React from 'react'
import { Field, FieldProps, getErrorMessage } from './Field'
import { MultiSelectProps, MultiSelect } from './MultiSelect'

export type MultiSelectFieldProps = MultiSelectProps & FieldProps

export const MultiSelectField = React.forwardRef<
  HTMLSelectElement,
  MultiSelectFieldProps
>(
  (
    {
      id,
      label,
      name,
      value,
      options,
      onChange: handleChange,
      onSelect: handleSelect,
      placeholder,
      style,
      className,
      disabled,
      errorMessage,
      errors,
      ...filedProps
    },
    ref
  ) => {
    const determinedErrorMessage = getErrorMessage({
      name,
      errorMessage,
      errors,
    })

    return (
      <Field
        name={name}
        label={label}
        className={className}
        style={style}
        errorMessage={determinedErrorMessage}
        {...filedProps}
      >
        <MultiSelect
          ref={ref}
          id={id}
          name={name}
          value={value}
          options={options}
          disabled={disabled}
          onSelect={handleSelect}
          onChange={handleChange}
          placeholder={placeholder}
          closeMenuOnSelect={false}
        />
      </Field>
    )
  }
)

MultiSelectField.displayName = 'Fields.MultiSelectField'
