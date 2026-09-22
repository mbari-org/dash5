import React, { useEffect, useRef, useState } from 'react'

export type SendVia = 'cellsat' | 'cell' | 'sat'
export type LaunchAction = 'command' | 'none'

export interface LaunchCommandDialogProps {
  event: 'launch' | 'recover'
  isSubmitting?: boolean
  onConfirmWithCommand: (
    command: string,
    via: SendVia,
    timeout?: number
  ) => void
  onConfirmNoCommand: () => void
  onCancel: () => void
}

const styles = {
  overlay:
    'fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm',
  card: 'w-full max-w-md rounded-lg border border-stone-200 bg-white shadow-xl',
  header:
    'flex items-center justify-between rounded-t-lg bg-stone-100 px-4 py-3',
  title: 'font-display text-base font-semibold text-stone-700',
  body: 'flex flex-col gap-3 px-4 py-4',
  radioRow: 'flex items-center gap-2 text-sm text-stone-700 cursor-pointer',
  fieldRow: 'ml-6 flex flex-col gap-2',
  fieldInline: 'ml-6 flex flex-wrap items-center gap-3',
  input:
    'rounded border border-stone-300 bg-stone-50 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400',
  label: 'text-xs font-medium text-stone-500',
  select:
    'rounded border border-stone-300 bg-stone-50 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400',
  footer: 'flex justify-end gap-2 border-t border-stone-100 px-4 py-3',
  cancelBtn:
    'rounded border border-stone-300 px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-50',
  submitBtn:
    'rounded bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700 disabled:opacity-40',
}

export const LaunchCommandDialog: React.FC<LaunchCommandDialogProps> = ({
  event,
  isSubmitting = false,
  onConfirmWithCommand,
  onConfirmNoCommand,
  onCancel,
}) => {
  const [action, setAction] = useState<LaunchAction>('command')
  const [command, setCommand] = useState('restart logs')
  const [via, setVia] = useState<SendVia>('cellsat')
  const [timeout, setTimeoutMin] = useState(5)
  // Synchronous guard against double-clicks before the isSubmitting prop
  // re-renders from the parent — useRef fires before React's next render cycle.
  const hasSubmittedRef = useRef(false)
  // Ref for the dialog card — used for focus trap and aria wiring.
  const dialogRef = useRef<HTMLDivElement>(null)

  // Accessibility: save focused element before dialog opens so focus can be
  // restored when the dialog closes (keyboard / screen-reader users).
  // Focus the first focusable control (not the container) so Shift+Tab starts
  // inside the trap boundary and cannot escape on the first keypress.
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
      'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const first = focusable?.[0]
    if (first) {
      first.focus()
    } else {
      dialogRef.current?.focus()
    }
    return () => {
      previousFocus?.focus()
    }
  }, [])

  // Accessibility: Escape dismisses the dialog (unless a submission is in
  // flight, matching the Cancel button's disabled state).
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) onCancel()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isSubmitting, onCancel])

  // Accessibility: trap Tab / Shift+Tab inside the dialog so keyboard users
  // cannot accidentally reach elements in the underlying deployment popup.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !dialogRef.current) return
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const showTimeout = via === 'cellsat' || via === 'cell'
  const eventLabel = event === 'launch' ? 'Launch' : 'Recover'
  const canSubmit = action !== 'command' || command.trim().length > 0

  const handleSubmit = () => {
    if (hasSubmittedRef.current || isSubmitting) return
    hasSubmittedRef.current = true
    if (action === 'command') {
      onConfirmWithCommand(
        command.trim(),
        via,
        showTimeout ? timeout : undefined
      )
    } else {
      onConfirmNoCommand()
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="launch-dialog-title"
      ref={dialogRef}
      tabIndex={-1}
      className={styles.overlay}
      style={{ zIndex: 1100 }}
    >
      <div className={styles.card}>
        <div className={styles.header}>
          <span id="launch-dialog-title" className={styles.title}>
            Record {eventLabel} Event
          </span>{' '}
        </div>

        <div className={styles.body}>
          {/* Option 1: Send a command */}
          <label className={styles.radioRow}>
            <input
              type="radio"
              name="launchAction"
              value="command"
              checked={action === 'command'}
              onChange={() => setAction('command')}
              className="accent-indigo-600"
            />
            Also issue this command:
          </label>

          {action === 'command' && (
            <>
              <div className={styles.fieldRow}>
                <input
                  type="text"
                  className={`${styles.input} w-full`}
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  placeholder="Command"
                  aria-label="command text"
                />
              </div>
              <div className={styles.fieldInline}>
                <div>
                  <div className={styles.label}>Send via</div>
                  <select
                    className={styles.select}
                    value={via}
                    onChange={(e) => setVia(e.target.value as SendVia)}
                    aria-label="send via"
                  >
                    <option value="cellsat">Cell + Sat</option>
                    <option value="cell">Cell only</option>
                    <option value="sat">Sat only</option>
                  </select>
                </div>
                {showTimeout && (
                  <div>
                    <div className={styles.label}>Timeout (min)</div>
                    <input
                      type="number"
                      className={`${styles.input} w-20`}
                      value={timeout}
                      min={1}
                      onChange={(e) =>
                        setTimeoutMin(
                          Math.max(1, parseInt(e.target.value) || 1)
                        )
                      }
                      aria-label="timeout minutes"
                    />
                  </div>
                )}
              </div>
            </>
          )}

          {/* Option 2: No command */}
          <label className={styles.radioRow}>
            <input
              type="radio"
              name="launchAction"
              value="none"
              checked={action === 'none'}
              onChange={() => setAction('none')}
              className="accent-indigo-600"
            />
            No command
          </label>
        </div>

        <div className={styles.footer}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className={styles.submitBtn}
            disabled={!canSubmit || isSubmitting}
            onClick={handleSubmit}
          >
            Record &amp; Submit
          </button>
        </div>
      </div>
    </div>
  )
}

LaunchCommandDialog.displayName = 'Components.LaunchCommandDialog'
