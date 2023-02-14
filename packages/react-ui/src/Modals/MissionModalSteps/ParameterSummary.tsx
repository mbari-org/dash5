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
  unitOptions,
}) => {
  return (
    <article className="flex h-full flex-col">
      <ul className="ml-2 mb-2 flex-shrink-0 flex-grow-0">
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
        className=""
        parameters={parameters}
        onParamUpdate={onParamUpdate}
        onVerifyValue={onVerifyValue}
        unitOptions={unitOptions}
      />
      <StatDisplay
        totalDistance={totalDistance}
        bottomDepth={bottomDepth}
        duration={duration}
        className="flex-shrink-0 flex-grow-0"
      />
    </article>
  )
}
