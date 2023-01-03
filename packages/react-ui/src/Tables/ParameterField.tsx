import React, { useEffect, useState } from 'react'
import { Input } from '../Fields'
import rulerDark from '@mbari/react-ui/assets/ruler-dark.png'
import rulerLight from '@mbari/react-ui/assets/ruler-light.png'
import { ParameterTableProps } from './ParameterTable'

export interface ParameterFieldProps {
  className?: string
  overrideValue?: string
  onOverride: (newOverride: string) => void
  onVerifyValue?: ParameterTableProps['onVerifyValue']
}

const styles = {
  container: 'flex h-[40px] w-full',
  inputLi: 'flex flex-grow rounded',
  buttonLi: 'ml-2 h-full aspect-square rounded border-2 border-stone-300/60',
  button: 'h-full w-full bg-white p-1 justify-center flex',
  ruler: 'aspect-square h-full bg-white bg-cover bg-center',
}

export const ParameterField: React.FC<ParameterFieldProps> = ({
  overrideValue,
  onOverride,
  onVerifyValue,
}) => {
  const [inputValue, setInputValue] = useState(overrideValue ?? '')

  const handleOverride = (newValue: string) => {
    onOverride(newValue)
    setInputValue(newValue)
  }

  useEffect(() => {
    if (inputValue !== overrideValue) {
      setInputValue(overrideValue ? overrideValue : '')
    }
  }, [inputValue, overrideValue])

  const handleVerify = () => {
    if (onVerifyValue) {
      onVerifyValue(overrideValue ?? '')
    }
  }

  return (
    <ul className={styles.container}>
      <li className={styles.inputLi}>
        <Input
          name="overrride"
          value={inputValue}
          onChange={(e) => handleOverride(e.target.value)}
        />
      </li>
      <li className={styles.buttonLi}>
        <button className={styles.button} onClick={handleVerify}>
          <span
            className={styles.ruler}
            style={{
              backgroundImage: `url(${overrideValue ? rulerDark : rulerLight})`,
            }}
          />
        </button>
      </li>
    </ul>
  )
}
