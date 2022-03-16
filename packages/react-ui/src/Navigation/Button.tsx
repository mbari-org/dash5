import React, { useState } from 'react'
import clsx from 'clsx'

export type ButtonAlignment = 'left' | 'right' | 'center' | 'stretch'
export type ButtonType = 'button' | 'submit' | 'reset' | undefined
export type ButtonAppearance =
  | 'destructive'
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'actionable'
  | 'custom'
  | 'link'

export interface ButtonProps {
  appearance?: ButtonAppearance
  align?: ButtonAlignment
  className?: string
  style?: React.CSSProperties
  type?: ButtonType
  disabled?: boolean
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  form?: string
}

const BUTTON_STYLES =
  'rounded font-semibold text-sm text-center uppercase px-5 py-3 w-auto'
const LINK_STYLES = 'flex font-semibold text-emerald-600 underline'
const DISABLED_STYLES = 'opacity-50 cursor-not-allowed'

export const backgroundStyles = (appearance?: ButtonAppearance) => {
  switch (appearance) {
    case 'primary':
      return 'bg-indigo-600 text-white'
    case 'secondary':
      return 'bg-white border-2 border-indigo-600 text-indigo-600'
    case 'destructive':
      return 'bg-red-600 text-white'
    case 'accent':
      return 'bg-emerald-600 text-white'
    case 'custom':
    case 'link':
      return ''
    default:
      return 'bg-indigo-600 text-white'
  }
}

const alignmentStyles = (alignment?: ButtonAlignment) => {
  switch (alignment) {
    case 'center':
      return 'w-auto mx-auto'
    case 'right':
      return 'w-auto ml-auto'
    case 'left':
      return 'w-auto mr-auto'
    case 'stretch':
      return 'w-full'
    default:
      return 'w-auto'
  }
}

export const Button: React.FC<ButtonProps> = ({
  align,
  appearance,
  children,
  className,
  disabled,
  style = {},
  onClick,
  form,
  type = 'button',
}) => {
  const [focus, setFocus] = useState(false)
  const [hover, setHover] = useState(false)
  const toggleState = (state: 'hover' | 'focus', newVal: boolean) => () => {
    state === 'hover' ? setHover(newVal) : setFocus(newVal)
  }
  const brightness = focus ? 0.97 : hover ? 1.03 : 1

  return (
    <button
      className={clsx(
        appearance === 'link' && LINK_STYLES,
        !['custom', 'link'].includes(appearance ?? '') && BUTTON_STYLES,
        backgroundStyles(appearance),
        alignmentStyles(align),
        disabled && DISABLED_STYLES,
        className
      )}
      disabled={disabled}
      style={{
        filter: brightness !== 1 ? `brightness(${brightness})` : '',
        ...style,
      }}
      onMouseDown={toggleState('focus', true)}
      onMouseUp={toggleState('focus', false)}
      onMouseEnter={toggleState('hover', true)}
      onMouseLeave={toggleState('hover', false)}
      onClick={onClick}
      form={form}
      type={type}
    >
      {children}
    </button>
  )
}

Button.displayName = 'Navigation.Button'
