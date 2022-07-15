import React from 'react'
import clsx from 'clsx'
import { swallow } from '@mbari/utils'

export interface VehicleInfoCellProps {
  className?: string
  style?: React.CSSProperties
  icon: JSX.Element
  headline: string
  subtitle?: string
  lastCommsOverSat?: string
  estimate?: string
  onSelect?: () => void
}

const styles = {
  container:
    'rounded-md border-2 border-solid border-stone-300 bg-white font-display drop-shadow-lg p-4',
  content: 'opacity-60 text-sm',
  button: 'w-full pl-2 text-left',
  subtitle: 'font-sans text-xs font-light text-left',
  topHalf: 'flex items-center p-2',
}

export const VehicleInfoCell: React.FC<VehicleInfoCellProps> = ({
  className,
  style,
  icon,
  headline,
  subtitle,
  lastCommsOverSat,
  estimate,
  onSelect,
}) => {
  return (
    <article className={clsx(styles.container, className)} style={style}>
      <button className={styles.button} onClick={swallow(onSelect)}>
        <section className={styles.topHalf}>
          <span className="pr-6">{icon}</span>
          <ul>
            <li>{headline}</li>
            <li className={clsx(styles.content, styles.subtitle)}>
              {subtitle}
            </li>
          </ul>
        </section>
        <section>
          <ul className={clsx(styles.content)}>
            {lastCommsOverSat && (
              <li className="pb-1">
                <span className="mr-1">Last comms over sat:</span>
                {lastCommsOverSat}
              </li>
            )}

            {estimate && <li aria-label={'time estimate'}>{estimate}</li>}
          </ul>
        </section>
      </button>
    </article>
  )
}

VehicleInfoCell.displayName = 'Cells.VehicleInfoCell'
