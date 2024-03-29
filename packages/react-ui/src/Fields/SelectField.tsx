import React from 'react'
import { Field, FieldProps, getErrorMessage } from './Field'
import { Select, SelectProps } from './Select'

export type SelectFieldProps = SelectProps & FieldProps

export const SelectField = React.forwardRef<
  HTMLSelectElement,
  SelectFieldProps
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
      clearable,
      ...fieldProps
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
        {...fieldProps}
      >
        <Select
          ref={ref}
          id={id}
          name={name}
          value={value ?? ''}
          options={options}
          disabled={disabled}
          onSelect={handleSelect}
          onChange={handleChange}
          placeholder={placeholder}
          clearable={clearable}
        />
      </Field>
    )
  }
)

SelectField.displayName = 'Fields.SelectField'
