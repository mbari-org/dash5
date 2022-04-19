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
    'rounded-md border-2 border-solid border-stone-300 bg-white font-display drop-shadow-lg',
  lighterText: 'opacity-60',
  button: 'w-full pl-2 text-left',
  subtitle: 'font-sans text-xs font-light',
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
          <span className=" pr-6">{icon}</span>
          <ul>
            <li>{headline}</li>
            <li className={clsx(styles.lighterText, styles.subtitle)}>
              {subtitle}
            </li>
          </ul>
        </section>
        <section>
          <ul className={clsx(styles.lighterText)}>
            {lastCommsOverSat && (
              <li className="pb-2 pl-2">
                <span className="mr-1">Last comms over sat:</span>
                {lastCommsOverSat}
              </li>
            )}

            {estimate && <li className="pb-2 pl-2">{estimate}</li>}
          </ul>
        </section>
      </button>
    </article>
  )
}

VehicleInfoCell.displayName = 'Cells.VehicleInfoCell'
