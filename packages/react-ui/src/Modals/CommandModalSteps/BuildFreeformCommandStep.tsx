import React, { useState } from 'react'
import { TextAreaField, TextAreaFieldProps } from '../../Fields'

export interface BuildFreeformCommandStepProps {
  command?: string | null
  onCommandTextChange?: (command: string) => void
}

export const BuildFreeformCommandStep: React.FC<
  BuildFreeformCommandStepProps
> = ({ command: initialCommand, onCommandTextChange }) => {
  const [command, setCommand] = useState(initialCommand)
  const handleChangedCommand: TextAreaFieldProps['onChange'] = (e) => {
    setCommand(e.target.value)
    onCommandTextChange?.(e.target.value)
  }

  return (
    <section className="flex h-full flex-col">
      <TextAreaField
        label="Command"
        name="command"
        onChange={handleChangedCommand}
        value={command ?? undefined}
        textAreaClassNames="h-40 font-mono"
      />
    </section>
  )
}
