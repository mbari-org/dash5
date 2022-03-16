import React from 'react'
import { Field, FieldProps, getErrorMessage } from './Field'
import { TextArea } from './TextArea'

export interface TextAreaFieldInputProps {
  placeholder?: string
  disabled?: boolean
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>
  onFocus?: React.FocusEventHandler<HTMLTextAreaElement>
  onBlur?: React.FocusEventHandler<HTMLTextAreaElement>
}

export type TextAreaFieldProps = TextAreaFieldInputProps & FieldProps

const hasError = (error?: string) => (error ?? '').length > 0

const getPaddingForField = (hasIcon?: boolean, searchField?: boolean) =>
  hasIcon ? (searchField ? 'pl-8' : 'pr-8') : ''

export const TextAreaField = React.forwardRef<
  HTMLTextAreaElement,
  TextAreaFieldProps
>(
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
        <TextArea
          name={name}
          placeholder={placeholder}
          disabled={disabled}
          error={hasError(determinedErrorMessage)}
          ref={forwardedRef}
          className={getPaddingForField(hasIcon)}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      </Field>
    )
  }
)

TextAreaField.displayName = 'Form.TextAreaField'
