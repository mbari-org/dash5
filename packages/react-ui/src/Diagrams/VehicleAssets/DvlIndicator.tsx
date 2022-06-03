import React from 'react'
import clsx from 'clsx'
import { VehicleProps } from '../Vehicle'

export interface DvlIndicatorProps {
  colorDvl: VehicleProps['colorDvl']
  textDvlStatus: VehicleProps['textDvlStatus']
  isDocked?: boolean
}

export const DvlIndicator: React.FC<DvlIndicatorProps> = ({
  colorDvl,
  textDvlStatus,
  isDocked,
}) => {
  return (
    <>
      <polygon
        name="dvl"
        className={colorDvl}
        points="541.91,287.26 553.41,287.26 558.97,295.79 541.52,295.79"
      />
      <text
        name="text_dvlstatus"
        transform="matrix(1 0 0 1 542 304)"
        className="st12 st9 st13"
      >
        {textDvlStatus}
      </text>

      <text
        transform="matrix(1 0 0 1 540.0956 283.4494)"
        className={clsx(isDocked ? 'st18' : 'st9 st10')}
      >
        DVL
      </text>
    </>
  )
}
