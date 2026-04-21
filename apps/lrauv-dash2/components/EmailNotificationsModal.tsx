import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Modal, Button } from '@mbari/react-ui'
import {
  useTethysApiContext,
  useEmailSettings,
  useUpdateEmailSettings,
  useSendTestEmail,
  useSiteConfig,
  EventKind,
} from '@mbari/api-client'
import { useQueryClient } from 'react-query'
import VehiclePickerModal from './VehiclePickerModal'
import FilteredNotificationEditModal from './FilteredNotificationEditModal'
import { FilterRowUi, FilteringType } from '../types'

export interface EmailNotificationsModalProps {
  onClose?: () => void
}

const EmailNotificationsModal: React.FC<EmailNotificationsModalProps> = ({
  onClose,
}) => {
  const { profile, axiosInstance, token } = useTethysApiContext()
  const queryClient = useQueryClient()
  const email = profile?.email ?? ''

  const { data: siteInfo, isLoading: isSiteConfigLoading } = useSiteConfig()
  const vehicleNames = useMemo(
    () =>
      [...(siteInfo?.vehicleNames ?? [])].sort((a, b) => a.localeCompare(b)),
    [siteInfo?.vehicleNames]
  )
  const eventKinds: EventKind[] = useMemo(
    () => siteInfo?.eventKinds ?? [],
    [siteInfo?.eventKinds]
  )

  const { data: settings, isLoading: isSettingsLoading } = useEmailSettings(
    { email },
    { enabled: email.length > 0 }
  )

  const initialPlainText = useMemo(() => {
    const pt = (settings?.plainText as string | boolean | undefined) ?? 'n'
    if (typeof pt === 'string') return pt.toLowerCase() === 'y'
    return Boolean(pt)
  }, [settings])

  const initVehiclesSelection = useCallback((): Record<string, boolean> => {
    const sel: Record<string, boolean> = {}
    vehicleNames.forEach((v) => (sel[v] = false))
    return sel
  }, [vehicleNames])

  const displayEventKind = useCallback(
    (eventKindName: string): string => {
      const ek = eventKinds.find((k) => k.name === eventKindName)
      if (!ek) return eventKindName
      return `${ek.base}${ek.subkind ? ` | ${ek.subkind}` : ''}`
    },
    [eventKinds]
  )

  const initialVehiclesEnabled: Record<string, boolean> = useMemo(() => {
    const enabled: Record<string, boolean> = {}
    // When no settings have been saved yet, default all vehicles to selected
    if (!settings?.details) {
      vehicleNames.forEach((v) => (enabled[v] = true))
      return enabled
    }
    vehicleNames.forEach((v) => (enabled[v] = false))
    const list = settings.details.vehiclesEnabled as string[] | undefined
    if (Array.isArray(list)) {
      list.forEach((name) => {
        if (name in enabled) enabled[name] = true
      })
      return enabled
    }
    const lines = settings.details.notifLines as
      | { vehiclesChecked?: string[] }[]
      | undefined
    if (Array.isArray(lines) && lines.length > 0) {
      const firstChecked = lines[0]?.vehiclesChecked
      firstChecked?.forEach((name) => {
        if (name in enabled) enabled[name] = true
      })
    }
    return enabled
  }, [settings, vehicleNames])

  const toUiFilteredRows = useCallback((): FilterRowUi[] => {
    const notifLines = (settings?.details?.notifLines ?? []) as Array<{
      eventKind: string
      textFilter?: string | null
      filteringType?: FilteringType
      vehiclesChecked?: string[]
    }>
    return notifLines.map((line) => {
      const vehiclesChecked: Record<string, boolean> = initVehiclesSelection()
      const arr: string[] = Array.isArray(line?.vehiclesChecked)
        ? (line.vehiclesChecked as string[])
        : []
      arr.forEach((name) => {
        if (name in vehiclesChecked) vehiclesChecked[name] = true
      })
      return {
        eventKindName: line.eventKind,
        textFilter: line.textFilter ?? '',
        filteringType: (line.filteringType as FilteringType) ?? 'LITERAL',
        vehiclesChecked,
        isEditing: false,
      }
    })
  }, [settings, initVehiclesSelection])

  const [plainText, setPlainText] = useState<boolean>(() => initialPlainText)
  const [vehiclesEnabled, setVehiclesEnabled] = useState<
    Record<string, boolean>
  >(() => initialVehiclesEnabled)
  const [filteredRows, setFilteredRows] = useState<FilterRowUi[]>(() =>
    toUiFilteredRows()
  )

  useEffect(() => {
    setPlainText(initialPlainText)
  }, [initialPlainText])

  useEffect(() => {
    setVehiclesEnabled((prev) => {
      let same = true
      for (const name of vehicleNames) {
        if (Boolean(prev[name]) !== Boolean(initialVehiclesEnabled[name])) {
          same = false
          break
        }
      }
      return same ? prev : { ...initialVehiclesEnabled }
    })
  }, [initialVehiclesEnabled, vehicleNames])

  useEffect(() => {
    setFilteredRows((prev) => {
      const next = toUiFilteredRows()
      if (prev.length !== next.length) return next
      for (let i = 0; i < prev.length; i += 1) {
        const a = prev[i]
        const b = next[i]
        if (
          a.eventKindName !== b.eventKindName ||
          a.textFilter !== b.textFilter ||
          a.filteringType !== b.filteringType
        ) {
          return next
        }
      }
      return prev
    })
  }, [toUiFilteredRows])

  const { mutate: saveSettings, isLoading: isSaving } = useUpdateEmailSettings()
  const { mutate: sendTest, isLoading: isTesting } = useSendTestEmail()

  const [isDeleting, setIsDeleting] = useState(false)
  const [sendTestStatus, setSendTestStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle')
  const [sendTestMessage, setSendTestMessage] = useState<string>('')

  const toggleUnfilteredVehicle = (name: string) => {
    setVehiclesEnabled((prev) => ({ ...prev, [name]: !prev[name] }))
  }

  const [openPicker, setOpenPicker] = useState<null | 'unfiltered'>(null)
  // Filtered notification edit modal state; idx -1 means create
  const [editModal, setEditModal] = useState<{ idx: number } | null>(null)

  const selectAllUnfiltered = () => {
    const all: Record<string, boolean> = {}
    vehicleNames.forEach((v) => (all[v] = true))
    setVehiclesEnabled(all)
  }

  const clearAllUnfiltered = () => {
    const none: Record<string, boolean> = {}
    vehicleNames.forEach((v) => (none[v] = false))
    setVehiclesEnabled(none)
  }

  const computeEditInitial = useCallback((): FilterRowUi => {
    const defaultEk = eventKinds[0]?.name ?? ''
    if (editModal?.idx === -1) {
      return {
        eventKindName: defaultEk,
        textFilter: '',
        filteringType: 'LITERAL',
        vehiclesChecked: initVehiclesSelection(),
      } as FilterRowUi
    }
    const src = filteredRows[editModal!.idx]
    return {
      eventKindName: src.eventKindName,
      textFilter: src.textFilter,
      filteringType: src.filteringType,
      vehiclesChecked: { ...src.vehiclesChecked },
    } as FilterRowUi
  }, [editModal, eventKinds, filteredRows, initVehiclesSelection])

  const handleEditSave = useCallback(
    (draft: FilterRowUi) => {
      if (editModal?.idx === -1) {
        setFilteredRows((prev) => [...prev, { ...draft, isEditing: false }])
      } else if (typeof editModal?.idx === 'number') {
        setFilteredRows((prev) => {
          const next = [...prev]
          next[editModal.idx] = { ...draft, isEditing: false }
          return next
        })
      }
      setEditModal(null)
    },
    [editModal]
  )

  const handleEditDelete = useCallback(() => {
    if (typeof editModal?.idx === 'number') {
      const idx = editModal.idx
      setFilteredRows((prev) => prev.filter((_, i) => i !== idx))
      setEditModal(null)
    }
  }, [editModal])

  const handleSave = () => {
    if (!email) return
    const vehiclesEnabledArray = Object.entries(vehiclesEnabled)
      .filter(([, enabled]) => enabled)
      .map(([name]) => name)
    const notifLines = filteredRows.map((r) => {
      const checked = Object.entries(r.vehiclesChecked)
        .filter(([, v]) => v)
        .map(([name]) => name)
      return {
        eventKind: r.eventKindName,
        textFilter: r.textFilter || null,
        filteringType: r.filteringType,
        vehiclesChecked: checked,
      }
    })
    const details = {
      ...(settings?.details ?? {}),
      vehiclesEnabled: vehiclesEnabledArray,
      notifLines,
    }
    saveSettings(
      {
        email,
        plainText: plainText ? 'y' : 'n',
        details,
      },
      {
        onSuccess: () => onClose?.(),
        onError: () =>
          alert('Failed to save notification settings. Please try again.'),
      }
    )
  }

  const handleSendTest = () => {
    if (!email) {
      console.warn('[SendTestEmail] Aborted: email is empty')
      return
    }
    const params = { email, plainText: plainText ? 'y' : ('n' as 'y' | 'n') }
    console.log('[SendTestEmail] Firing request:', params)
    setSendTestStatus('idle')
    setSendTestMessage('')
    sendTest(params, {
      onSuccess: (data) => {
        console.log('[SendTestEmail] TethysDash response:', data)
        const msg = data?.email_sent
          ? `Test email sent to ${data.email_sent}`
          : 'Test email sent'
        setSendTestStatus('success')
        setSendTestMessage(msg)
      },
      onError: (err) => {
        console.error('[SendTestEmail] Error:', err)
        const msg = (err as { message?: string })?.message ?? 'Unknown error'
        setSendTestStatus('error')
        setSendTestMessage(msg)
      },
    })
  }

  const handleDeleteAll = async () => {
    if (!email) return
    if (!confirm(`Delete all notification settings for ${email}?`)) return
    try {
      setIsDeleting(true)
      const url = '/ens'
      await axiosInstance!.delete(url, {
        params: { email },
        headers: { Authorization: `Bearer ${token}` },
      })
      queryClient.removeQueries(['email', 'settings', email])
      onClose?.()
    } catch {
      alert('Failed to delete notification settings. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const renderSelectedList = (names: string[]) => {
    if (names.length === 0)
      return <span className="text-stone-400">None selected</span>
    return <span>{names.join(', ')}</span>
  }

  const selectedUnfiltered = useMemo(
    () => vehicleNames.filter((n) => Boolean(vehiclesEnabled[n])),
    [vehicleNames, vehiclesEnabled]
  )

  const isDataLoading = isSiteConfigLoading || isSettingsLoading
  const isBusy = isSaving || isTesting || isDeleting || !email || isDataLoading

  return (
    <Modal
      title={<span className="text-2xl font-bold">Email notifications</span>}
      onClose={onClose}
      open
      style={{ minWidth: 800 }}
      onConfirm={handleSave}
      confirmButtonText="Save"
      disableConfirm={isBusy}
      onCancel={onClose}
      cancelButtonText="Close"
      extraButtons={[
        {
          buttonText: 'Delete all',
          appearance: 'secondary',
          onClick: handleDeleteAll,
          disabled: isBusy,
        },
      ]}
      blurBackground
    >
      <article className="flex flex-col">
        <section className="flex items-center justify-between pb-4">
          <div className="flex items-center">
            <span className="mr-2 text-sm font-medium">
              Send emails as plain text
            </span>
            <button
              className={`rounded border px-3 py-1 ${
                plainText
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-stone-400'
              }`}
              onClick={() => setPlainText((v) => !v)}
              aria-pressed={plainText}
            >
              {plainText ? 'On' : 'Off'}
            </button>
          </div>
          <div className="flex items-center gap-2">
            {sendTestStatus === 'success' && (
              <span className="text-sm text-green-600">
                {sendTestMessage || `Test email sent to ${email}`}
              </span>
            )}
            {sendTestStatus === 'error' && (
              <span className="text-sm text-red-600">
                Failed: {sendTestMessage || 'Unknown error'}
              </span>
            )}
            <Button
              appearance="secondary"
              onClick={handleSendTest}
              disabled={isBusy}
            >
              {isTesting ? 'Sending…' : 'Send test email'}
            </Button>
          </div>
        </section>

        <section className="-mx-4 border-t p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-bold">Receive All Notifications</span>
            <Button
              appearance="secondary"
              onClick={() => setOpenPicker('unfiltered')}
              disabled={isDataLoading}
            >
              {isDataLoading
                ? 'Loading…'
                : selectedUnfiltered.length === 0
                ? 'Add vehicles'
                : 'Edit vehicles'}
            </Button>
          </div>
          <div className="overflow-auto rounded border bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50">
                <tr className="border-b">
                  <th className="p-2">Vehicles selected</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b align-top text-stone-600">
                  <td className="p-2">
                    {renderSelectedList(selectedUnfiltered)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="-mx-4 border-t p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-bold">Receive Filtered Notifications</span>
            <Button
              appearance="secondary"
              onClick={() => setEditModal({ idx: -1 })}
            >
              Add filtered notification
            </Button>
          </div>

          <div className="overflow-auto rounded border bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50">
                <tr className="border-b">
                  <th className="p-2" style={{ width: 160 }}>
                    Event
                  </th>
                  <th className="p-2" style={{ width: 220 }}>
                    Text filter
                  </th>
                  <th className="p-2" style={{ width: 80 }}>
                    Mode
                  </th>
                  <th className="p-2">Vehicles selected</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.length === 0 ? (
                  <tr>
                    <td className="p-3 text-sm text-stone-400" colSpan={4}>
                      No filtered notifications
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row, idx) => {
                    const selectedForRow = vehicleNames.filter((n) =>
                      Boolean(row.vehiclesChecked[n])
                    )
                    if (row.isEditing) return null
                    return (
                      <tr
                        key={`${row.eventKindName}-${idx}`}
                        className="cursor-pointer border-b align-top text-stone-600 hover:bg-secondary-100"
                        onClick={() => setEditModal({ idx })}
                      >
                        <td className="p-2">
                          {displayEventKind(row.eventKindName)}
                        </td>
                        <td className="p-2">
                          <span
                            className={row.textFilter ? '' : 'text-stone-400'}
                          >
                            {row.textFilter || 'None selected'}
                          </span>
                        </td>
                        <td className="p-2">
                          <span className="uppercase text-stone-600">
                            {row.filteringType}
                          </span>
                        </td>
                        <td className="p-2">
                          {renderSelectedList(selectedForRow)}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </article>
      {openPicker !== null && (
        <VehiclePickerModal
          vehicleNames={vehicleNames}
          selectedMap={vehiclesEnabled}
          onToggle={(name: string) => {
            if (openPicker === 'unfiltered') toggleUnfilteredVehicle(name)
          }}
          onSelectAll={() => {
            if (openPicker === 'unfiltered') selectAllUnfiltered()
          }}
          onClearAll={() => {
            if (openPicker === 'unfiltered') clearAllUnfiltered()
          }}
          onClose={() => setOpenPicker(null)}
        />
      )}
      {editModal && (
        <FilteredNotificationEditModal
          open
          mode={editModal.idx === -1 ? 'create' : 'edit'}
          initial={computeEditInitial()}
          eventKinds={eventKinds}
          vehicleNames={vehicleNames}
          onClose={() => setEditModal(null)}
          onSave={handleEditSave}
          onDelete={editModal.idx === -1 ? undefined : handleEditDelete}
        />
      )}
    </Modal>
  )
}

export default EmailNotificationsModal
