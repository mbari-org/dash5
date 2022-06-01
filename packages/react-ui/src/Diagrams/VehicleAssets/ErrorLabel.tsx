import React from 'react'
import clsx from 'clsx'
import { styles } from '../Vehicle'

export const ErrorLabel = () => {
  return (
    <g>
      <text
        aria-label="text_criticalerror"
        transform="matrix(1 0 0 1 154.0 176)"
        className={'fill-red-700'}
      ></text>
      <text
        aria-label="text_criticaltime"
        transform="matrix(1 0 0 1 156 183)"
        className={clsx(styles.textGray, styles.text6px)}
      ></text>
    </g>
  )
}
