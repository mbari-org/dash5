import React from 'react'
import { Field, FieldProps, getErrorMessage } from './Field'
import { Input } from './Input'

export interface TextFieldInputProps {
  placeholder?: string
  disabled?: boolean
  onChange?: React.ChangeEventHandler<HTMLInputElement>
  onFocus?: React.FocusEventHandler<HTMLInputElement>
  onBlur?: React.FocusEventHandler<HTMLInputElement>
  type?: string
}

export type TextFieldProps = TextFieldInputProps & FieldProps

const hasError = (error?: string) => (error ?? '').length > 0

const getPaddingForField = (hasIcon?: boolean, searchField?: boolean) =>
  hasIcon ? (searchField ? 'pl-8' : 'pr-8') : ''

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      name,
      placeholder,
      className,
      style,
      disabled,
      errorMessage,
      errors,
      onChange,
      onBlur,
      onFocus,
      ...fieldProps
    },
    forwardedRef
  ) => {
    const determinedErrorMessage = getErrorMessage({
      name,
      errorMessage,
      errors,
    })
    const hasIcon = typeof fieldProps.icon !== 'undefined'
    return (
      <Field
        name={name}
        className={className}
        style={style}
        errorMessage={determinedErrorMessage}
        {...fieldProps}
      >
        <Input
          name={name}
          placeholder={placeholder}
          disabled={disabled}
          error={hasError(determinedErrorMessage)}
          ref={forwardedRef}
          className={getPaddingForField(hasIcon)}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          type={fieldProps.type}
        />
      </Field>
    )
  }
)

TextField.displayName = 'Form.TextField'
