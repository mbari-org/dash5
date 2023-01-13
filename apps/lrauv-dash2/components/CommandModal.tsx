import { CommandModal as CommandModalView } from '@mbari/react-ui'
import {
  useCommands,
  useFrequentCommands,
  useRecentCommands,
} from '@mbari/api-client'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import { useState } from 'react'

export interface CommandModalProps {
  onClose: () => void
  className?: string
  style?: React.CSSProperties
}

export const CommandModal: React.FC<CommandModalProps> = ({
  onClose,
  className,
  style,
}) => {
  const [currentCommandId, setCurrentCommand] = useState<
    string | null | undefined
  >()
  const steps = ['Command', 'Build', 'Schedule']
  const router = useRouter()
  const params = (router.query?.deployment ?? []) as string[]
  const vehicleName = params[0]

  const { data: commandData } = useCommands()
  const { data: recentCommandsData } = useRecentCommands({
    vehicle: vehicleName,
  })
  const { data: frequentCommandsData } = useFrequentCommands({
    vehicle: vehicleName,
  })

  const commands =
    commandData?.commands.map((c) => ({
      id: c.keyword,
      name: c.keyword,
      description: c.description,
    })) ?? []

  const recentCommands =
    recentCommandsData?.map((c) => ({
      id: c.id,
      name: c?.writtenCommand,
      description: c?.note ?? 'no notes',
    })) ?? []

  const frequentCommands =
    frequentCommandsData?.map((c) => ({
      id: c?.writtenCommand ?? c?.command?.keyword,
      name: c?.writtenCommand,
      description: commandData?.commands.find(
        (cd) => cd.keyword === c?.command?.keyword
      )?.description,
    })) ?? []

  const handleSubmit = () => {
    toast.success('Command sent!')
    onClose()
  }

  const syntaxVariations = commandData?.commands.find(
    (c) => c.keyword === currentCommandId
  )?.syntaxList

  return (
    <CommandModalView
      className={className}
      style={style}
      commands={commands}
      recentCommands={recentCommands}
      frequentCommands={frequentCommands}
      currentIndex={0}
      onSubmit={handleSubmit}
      onCancel={onClose}
      vehicleName={vehicleName}
      steps={steps}
      onSelectCommandId={setCurrentCommand}
      syntaxVariations={syntaxVariations ?? []}
    />
  )
}
