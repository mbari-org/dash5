import React from 'react'
import { ParameterTable } from '../../Tables/ParameterTable'
import { ParameterStepProps } from './ParameterStep'
import { StatDisplay } from './StatDisplay'

export const ParameterSummary: React.FC<ParameterStepProps> = ({
  vehicleName,
  mission,
  parameters,
  totalDistance,
  bottomDepth,
  duration,
  onParamUpdate,
  onVerifyValue,
}) => {
  return (
    <article className="h-full">
      <ul className="ml-2 mb-2">
        <li className="mb-4">
          Set mission parameters for {vehicleName}&apos;s{' '}
          <span className="text-teal-500" data-testid="mission name">
            {mission}
          </span>{' '}
          mission
        </li>
        <li>Summary of Overrides ({parameters.length})</li>
      </ul>
      <ParameterTable
        className="max-h-[calc(100%-90px)]"
        parameters={parameters}
        onParamUpdate={onParamUpdate}
        onVerifyValue={onVerifyValue}
      />
      <StatDisplay
        totalDistance={totalDistance}
        bottomDepth={bottomDepth}
        duration={duration}
      />
    </article>
  )
}
