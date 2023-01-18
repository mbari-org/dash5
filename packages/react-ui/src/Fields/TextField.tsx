import React from 'react'
import { Field, FieldProps, getErrorMessage } from './Field'
import { Input } from './Input'
import clsx from 'clsx'

export interface TextFieldInputProps {
  placeholder?: string
  disabled?: boolean
  /**
   * @description If true it applies material design styles
   */
  materialDesign?: boolean
  onChange?: React.ChangeEventHandler<HTMLInputElement>
  onFocus?: React.FocusEventHandler<HTMLInputElement>
  onBlur?: React.FocusEventHandler<HTMLInputElement>
  type?: string
  children?: React.ReactNode
}

export type TextFieldProps = TextFieldInputProps & FieldProps

const hasError = (error?: string) => (error ?? '').length > 0

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      name,
      placeholder,
      className,
      materialDesign = false,
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

    const inputClasses = clsx({
      'pl-9': hasIcon,
      'border-0 border-b-2 rounded-none': materialDesign,
    })

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
          className={inputClasses}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          type={fieldProps.type}
        />
      </Field>
    )
  }
)

TextField.displayName = 'Fields.TextField'
