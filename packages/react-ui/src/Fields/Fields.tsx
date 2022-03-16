import React from 'react'
import clsx from 'clsx'

export interface FieldsProps {
  className?: string
  style?: React.CSSProperties
  /**
   * Add additional styling and responsive row layout within parent fieldset.
   */
  nested?: boolean
  /**
   * Set to true if you always want the component to render with a flex-col layout.
   */
  strictVertical?: boolean
  /**
   * If true flex-grow will be applied to child elements.
   */
  grow?: boolean
  /**
   * Any errors to map to applicable fields. This will also be passed to nested fields.
   */
  errors?: any
  /**
   * Used to map react-hook-form's register method to child fields. This will also be passed to nested fields.
   */
  register?: any
}

const style = {
  list: 'flex flex-col flex-grow',
  topLevelList: 'max-w-full',
  nestedList: '-m-2 sm:flex-row',
  nestedCol: '-m-2',
  item: 'flex flex-grow flex-shrink-0 p-2',
  responsiveGrowth: 'sm:flex-grow-0',
}

export const Fields: React.FC<FieldsProps> = ({
  className,
  children,
  nested,
  strictVertical,
  grow,
  register = () => {},
  errors,
}) => (
  <ul
    className={clsx([
      style.list,
      nested
        ? strictVertical
          ? style.nestedCol
          : style.nestedList
        : style.topLevelList,
      grow ? '' : style.responsiveGrowth,
      className,
    ])}
  >
    {React.Children.map(children, (child: any, index) =>
      child ? (
        <li
          className={clsx([
            child?.props.type === 'hidden' ? 'h-0 w-0' : style.item,
            child?.props.type !== 'hidden' && grow
              ? ''
              : style.responsiveGrowth,
          ])}
        >
          {child?.props?.name || child?.props?.nested
            ? React.createElement(child.type, {
                ...{
                  ...child.props,
                  register,
                  errors,
                  key: `child${child.type}${index}${child?.props?.name ?? ''}`,
                  ...(child?.props?.name ? register?.(child?.props?.name) : {}),
                },
              })
            : React.createElement(child.type, {
                ...{
                  ...child.props,
                  key: `child${child.type}${index}`,
                },
              })}
        </li>
      ) : null
    )}
  </ul>
)

Fields.displayName = 'Fields.Fields'
