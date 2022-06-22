import React, { useState } from 'react'
import { Input } from '../Fields'
import rulerDark from '../assets/ruler-dark.png'
import rulerLight from '../assets/ruler-light.png'
import { ParameterTableProps } from './ParameterTable'

export interface ParameterFieldProps {
  customValue?: string
  onVerifyValue: ParameterTableProps['onVerifyValue']
}

const styles = {
  container: 'flex h-full w-full',
  inputLi: 'flex flex-grow rounded',
  buttonLi: 'ml-2 h-full w-1/12 rounded border-2 border-stone-300/60',
  button: 'h-full w-full bg-white p-2',
  ruler: 'flex aspect-square h-full bg-white bg-cover',
}

export const ParameterField: React.FC<ParameterFieldProps> = ({
  customValue,
  onVerifyValue,
}) => {
  const [overrideValue, setOverrideValue] = useState(customValue || '')

  const handleVerify = () => {
    const verifiedValue = onVerifyValue(overrideValue)
    console.log(verifiedValue)
    setOverrideValue(verifiedValue)
  }
  return (
    <ul className={styles.container}>
      <li className={styles.inputLi}>
        <Input
          name="overrride"
          value={overrideValue}
          onChange={(e) => setOverrideValue(e.target.value)}
        />
      </li>
      <li className={styles.buttonLi}>
        <button className={styles.button} onClick={handleVerify}>
          <span
            className={styles.ruler}
            style={{
              backgroundImage: `url(${customValue ? rulerDark : rulerLight})`,
            }}
          />
        </button>
      </li>
    </ul>
  )
}
