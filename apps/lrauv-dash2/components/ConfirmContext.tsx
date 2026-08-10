import React, {
  createContext,
  useContext,
  useState,
  useRef,
  ReactNode,
} from 'react'
import { Modal } from '@mbari/react-ui'

interface ConfirmOptions {
  title: string
  confirmLabel?: string
  cancelLabel?: string
  nonDestructive?: boolean
}

interface ConfirmContextProps {
  confirm: (options: ConfirmOptions) => Promise<boolean>
}

const ConfirmationContext = createContext<ConfirmContextProps | undefined>(
  undefined
)

export const ConfirmationProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const resolverRef = useRef<((value: boolean) => void) | null>(null)

  const confirm = (confirmOptions: ConfirmOptions): Promise<boolean> => {
    setOptions(confirmOptions)
    setIsOpen(true)

    // store resolve function, calling it later once a button is clicked
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve
    })
  }

  // resolve the promise via one of these two, after user has clicked one of the associated buttons
  const handleConfirm = () => {
    resolverRef.current?.(true)
    setIsOpen(false)
  }

  const handleCancel = () => {
    resolverRef.current?.(false)
    setIsOpen(false)
  }

  return (
    <ConfirmationContext.Provider value={{ confirm }}>
      {children}
      {isOpen && options && (
        <Modal
          title={options.title}
          onClose={handleCancel}
          onCancel={handleCancel}
          onConfirm={handleConfirm}
          confirmButtonAppearance={
            options.nonDestructive ? 'primary' : 'destructive'
          }
          open
          blurBackground
          fullWidthBody
          headerClassName="mb-6"
        />
      )}
    </ConfirmationContext.Provider>
  )
}

export const useConfirm = () => {
  const context = useContext(ConfirmationContext)
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmationProvider')
  }
  return context.confirm
}
