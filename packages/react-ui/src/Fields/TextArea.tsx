import React from 'react'
import { concatStyles } from 'utils'

export interface TextAreaProps {
  name: string
  className?: string
  style?: React.CSSProperties
  placeholder?: string
  value?: string
  error?: boolean
  disabled?: boolean
  onBlur?: React.FocusEventHandler<HTMLTextAreaElement>
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>
  onFocus?: React.FocusEventHandler<HTMLTextAreaElement>
  onKeyUp?: React.KeyboardEventHandler<HTMLTextAreaElement>
  onKeyDown?: React.KeyboardEventHandler<HTMLTextAreaElement>
}

const INPUT_STYLE =
  'font-body border rounded p-2 flex flex-grow max-w-full focus:outline-none focus:border-actionable'

const getErrorStyles = (error?: boolean) =>
  error ? 'border-error text-error' : ''
const getDisabledStyles = (disabled?: boolean) =>
  disabled ? 'opacity-50 cursor-not-allowed' : ''

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      name,
      error,
      disabled,
      className,
      placeholder,
      value,
      style,
      onBlur,
      onChange,
      onFocus,
      onKeyUp,
      onKeyDown,
    },
    forwardedRef
  ) => {
    const controlledInputProps = value ? { value } : {}
    return (
      <textarea
        name={name}
        ref={forwardedRef}
        className={concatStyles([
          INPUT_STYLE,
          getErrorStyles(error),
          getDisabledStyles(disabled),
          className,
        ])}
        disabled={disabled}
        placeholder={placeholder}
        style={style}
        onBlur={onBlur}
        onChange={onChange}
        onFocus={onFocus}
        onKeyUp={onKeyUp}
        onKeyDown={onKeyDown}
        {...controlledInputProps}
      ></textarea>
    )
  }
)

TextArea.displayName = 'Form.TextArea'
