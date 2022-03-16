import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { faExclamationTriangle } from '@fortawesome/pro-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import clsx from 'clsx'
import React from 'react'
import { humanize } from 'utils'

const style = {
  list: 'my-2 border border-red-400 p-2 rounded flex flex-col',
  item: 'flex font-body text-red-600 text-sm',
  name: 'font-semibold',
}

export interface ErrorListProps {
  errors?: { [key: string]: { message: string } }
  className?: string
}

export const ErrorList: React.FC<ErrorListProps> = ({
  className,
  errors = {},
}) => {
  const keys = Object.keys(errors ?? {})
  return keys.length ? (
    <ul className={clsx(style.list, className)}>
      {keys.map((k) => (
        <li key={k} className={style.item}>
          <FontAwesomeIcon
            icon={faExclamationTriangle as IconProp}
            size="sm"
            className="my-auto mr-2 text-red-400"
          />
          <strong className={style.name}>{humanize(k)}&nbsp;</strong>{' '}
          {errors[k]?.message}
        </li>
      ))}
    </ul>
  ) : null
}
