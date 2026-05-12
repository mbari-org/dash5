import React from 'react'
import clsx from 'clsx'

export type ButtonAlignment = 'left' | 'right' | 'center' | 'stretch'
export type ButtonType = 'button' | 'submit' | 'reset' | undefined
export type ButtonAppearance =
  | 'destructive'
  | 'primary'
  | 'secondary'
  | 'transparent'
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
  tight?: boolean
  children?: React.ReactNode
}

const styles = {
  button:
    'rounded text-sm text-center w-auto font-display transition-all duration-150 ease-in-out',
  normal: 'px-4 py-2',
  tight: 'px-2 py-1',
  link: 'flex font-semibold text-emerald-600 underline',
  disabled: 'opacity-50 cursor-not-allowed',
}

export const backgroundStyles = (appearance?: ButtonAppearance) => {
  switch (appearance) {
    case 'primary':
      return 'bg-primary-600 text-white hover:bg-primary-700 hover:scale-[1.03] hover:shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-1'
    case 'secondary':
      return 'bg-white border border-stone-400 text-stone-600 hover:border-primary-500 hover:text-primary-700 hover:bg-primary-50 hover:scale-[1.03] hover:shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-1'
    case 'destructive':
      return 'bg-red-600 text-white hover:bg-red-700 hover:scale-[1.03] hover:shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-1'
    case 'transparent':
      return 'bg-transparent hover:bg-primary-600/10 hover:scale-[1.03] transition-colors duration-200'
    case 'custom':
    case 'link':
      return ''
    default:
      return 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-[1.03] hover:shadow-md active:scale-[0.98]'
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
  appearance = 'primary',
  children,
  className,
  disabled,
  style = {},
  onClick,
  form,
  type = 'button',
  tight,
}) => {
  const isStandardButton = !['custom', 'link'].includes(appearance ?? '')

  return (
    <button
      className={clsx(
        appearance === 'link' && styles.link,
        backgroundStyles(appearance),
        alignmentStyles(align),
        isStandardButton && styles.button,
        isStandardButton && (tight ? styles.tight : styles.normal),
        disabled && styles.disabled,
        className
      )}
      disabled={disabled}
      style={style}
      onClick={onClick}
      form={form}
      type={type}
    >
      {children}
    </button>
  )
}

Button.displayName = 'Navigation.Button'
