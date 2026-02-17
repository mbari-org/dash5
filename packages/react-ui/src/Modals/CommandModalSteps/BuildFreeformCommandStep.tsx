import React, { useState, useEffect } from 'react'
import { TextAreaField, TextAreaFieldProps } from '../../Fields'

export interface BuildFreeformCommandStepProps {
  command?: string | null
  onCommandTextChange?: (command: string) => void
}

export const BuildFreeformCommandStep: React.FC<
  BuildFreeformCommandStepProps
> = ({ command: initialCommand, onCommandTextChange }) => {
  const [command, setCommand] = useState(initialCommand ?? '')

  // Sync internal state with prop changes (only needed if prop changes externally ie when rerunning commands from schedule history)
  useEffect(() => {
    if (
      initialCommand !== undefined &&
      initialCommand !== null &&
      initialCommand !== command
    ) {
      setCommand(initialCommand)
    }
  }, [initialCommand, command])

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
