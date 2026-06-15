import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Modal, Button } from '@mbari/react-ui'
import toast from 'react-hot-toast'
import Tippy from '@tippyjs/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPencil, faPlus } from '@fortawesome/free-solid-svg-icons'
import {
  useTethysApiContext,
  useEmailSettings,
  useUpdateEmailSettings,
  useSendTestEmail,
  useSiteConfig,
  useEmailAddresses,
  useAddExtraEmail,
  useUpdateEmailAddress,
  useDeleteEmailAddress,
  EventKind,
} from '@mbari/api-client'
import { useQueryClient } from 'react-query'
import VehiclePickerModal from './VehiclePickerModal'
import FilteredNotificationEditModal from './FilteredNotificationEditModal'
import AddEmailDialog from './AddEmailDialog'
import EditEmailDialog from './EditEmailDialog'
import { FilterRowUi, FilteringType } from '../types'
import {
  isPhoneNumber,
  getDefaultDestType,
  saveDefaultDestType,
} from '../lib/notificationDestinations'

export interface EmailNotificationsModalProps {
  onClose?: () => void
}

const EmailNotificationsModal: React.FC<EmailNotificationsModalProps> = ({
  onClose,
}) => {
  const { profile, axiosInstance, token } = useTethysApiContext()
  const queryClient = useQueryClient()
  const accountEmail = profile?.email ?? ''

  // ── email address list ──────────────────────────────────────────────────
  const { data: addressesData, isLoading: isAddressesLoading } =
    useEmailAddresses(undefined, { enabled: accountEmail.length > 0 })

  const [selectedEmail, setSelectedEmail] = useState<string>('')

  const allEmails: string[] = useMemo(() => {
    const base = addressesData?.result
      ? Object.keys(addressesData.result).sort()
      : accountEmail
      ? [accountEmail]
      : []
    // Keep selectedEmail in the list during a pending refetch so the dropdown
    // never shows a selected address that isn't present in the options.
    if (selectedEmail && !base.includes(selectedEmail)) {
      return [...base, selectedEmail].sort()
    }
    return base
  }, [addressesData, accountEmail, selectedEmail])

  // default to account email once list loads
  useEffect(() => {
    if (!selectedEmail && accountEmail) {
      setSelectedEmail(accountEmail)
    }
  }, [accountEmail, selectedEmail])

  const isExtraEmail = selectedEmail !== '' && selectedEmail !== accountEmail

  // ── per-selected-email settings ─────────────────────────────────────────
  const { data: settings, isLoading: isSettingsLoading } = useEmailSettings(
    { email: selectedEmail },
    { enabled: selectedEmail.length > 0 }
  )

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

  const initialVehiclesEnabled: Record<string, boolean> = useMemo(() => {
    const enabled: Record<string, boolean> = {}
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

  const [plainText, setPlainText] = useState<boolean>(initialPlainText)
  const [vehiclesEnabled, setVehiclesEnabled] = useState<
    Record<string, boolean>
  >(initialVehiclesEnabled)
  const [filteredRows, setFilteredRows] = useState<FilterRowUi[]>(() =>
    toUiFilteredRows()
  )

  // re-init local state whenever selected email or loaded settings change
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
        // Also compare vehiclesChecked so switching emails resets per-row vehicle selections.
        const aKeys = Object.keys(a.vehiclesChecked)
        const bKeys = Object.keys(b.vehiclesChecked)
        if (aKeys.length !== bKeys.length) return next
        if (
          aKeys.some(
            (k) =>
              Boolean(a.vehiclesChecked[k]) !== Boolean(b.vehiclesChecked[k])
          )
        ) {
          return next
        }
      }
      return prev
    })
  }, [toUiFilteredRows])

  // ── mutations ────────────────────────────────────────────────────────────
  const { mutate: saveSettings, isLoading: isSaving } = useUpdateEmailSettings()
  const { mutate: sendTest, isLoading: isTesting } = useSendTestEmail()
  const { mutate: addExtraEmail, isLoading: isAddingEmail } = useAddExtraEmail()
  const { mutate: updateEmailAddress, isLoading: isUpdatingEmail } =
    useUpdateEmailAddress()
  const { mutate: deleteEmailAddress, isLoading: isDeletingEmail } =
    useDeleteEmailAddress()

  const [isDeleting, setIsDeleting] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [focusedIdx, setFocusedIdx] = useState(-1)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const listboxRef = useRef<HTMLUListElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  // close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const closeDropdown = useCallback(() => {
    setDropdownOpen(false)
    // Return focus to the trigger button so the user's position is preserved.
    triggerRef.current?.focus()
  }, [])

  const openDropdown = useCallback(() => {
    setFocusedIdx(allEmails.indexOf(selectedEmail))
    setDropdownOpen(true)
  }, [allEmails, selectedEmail])

  // When the listbox mounts, move focus into it so aria-activedescendant
  // is on the focused element (as required by the ARIA listbox pattern).
  useEffect(() => {
    if (dropdownOpen) {
      listboxRef.current?.focus()
    }
  }, [dropdownOpen])

  // Key handler for the trigger button — only handles "open" keys.
  const handleTriggerKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault()
        openDropdown()
      } else if (e.key === 'ArrowUp') {
        // ArrowUp opens the dropdown with focus on the last option.
        e.preventDefault()
        setFocusedIdx(allEmails.length - 1)
        setDropdownOpen(true)
      }
    },
    [openDropdown, allEmails.length]
  )

  // Key handler for the listbox — handles navigation while open.
  const handleDropdownKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setFocusedIdx((i) => Math.min(i + 1, allEmails.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setFocusedIdx((i) => Math.max(i - 1, 0))
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        if (focusedIdx >= 0 && focusedIdx < allEmails.length) {
          setSelectedEmail(allEmails[focusedIdx])
        }
        closeDropdown()
      } else if (e.key === 'Escape') {
        closeDropdown()
      } else if (e.key === 'Tab') {
        // Close the dropdown but let the browser handle Tab focus naturally;
        // don't force focus back to the trigger or it disrupts Tab order.
        setDropdownOpen(false)
      }
    },
    [focusedIdx, allEmails, closeDropdown]
  )

  const [sendTestStatus, setSendTestStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle')
  const [sendTestMessage, setSendTestMessage] = useState<string>('')
  const [defaultDestType, setDefaultDestType] = useState(getDefaultDestType)

  // Clear test-email feedback whenever the selected address changes so stale
  // success/error messages from a previous address don't linger.
  useEffect(() => {
    setSendTestStatus('idle')
    setSendTestMessage('')
  }, [selectedEmail])

  // ── sub-dialog state ─────────────────────────────────────────────────────
  const [showAddEmail, setShowAddEmail] = useState(false)
  const [showEditEmail, setShowEditEmail] = useState(false)
  const [openPicker, setOpenPicker] = useState<null | 'unfiltered'>(null)
  const [editModal, setEditModal] = useState<{ idx: number } | null>(null)

  // ── vehicle helpers ──────────────────────────────────────────────────────
  const toggleUnfilteredVehicle = (name: string) => {
    setVehiclesEnabled((prev) => ({ ...prev, [name]: !prev[name] }))
  }

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

  const displayEventKind = useCallback(
    (eventKindName: string): string => {
      const ek = eventKinds.find((k) => k.name === eventKindName)
      if (!ek) return eventKindName
      return `${ek.base}${ek.subkind ? ` | ${ek.subkind}` : ''}`
    },
    [eventKinds]
  )

  const selectedUnfiltered = useMemo(
    () => vehicleNames.filter((n) => Boolean(vehiclesEnabled[n])),
    [vehicleNames, vehiclesEnabled]
  )

  // ── filtered rows helpers ────────────────────────────────────────────────
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

  // ── save / delete / test ─────────────────────────────────────────────────
  const handleSave = () => {
    if (!selectedEmail) return
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
        email: selectedEmail,
        plainText: plainText ? 'y' : 'n',
        details,
      },
      {
        onSuccess: () => onClose?.(),
        onError: () => {
          toast.error('Failed to save notification settings. Please try again.')
        },
      }
    )
  }

  const handleSendTest = () => {
    if (!selectedEmail) return
    setSendTestStatus('idle')
    setSendTestMessage('')
    sendTest(
      {
        email: selectedEmail,
        plainText:
          isPhoneNumber(selectedEmail ?? '') || !plainText
            ? ('n' as 'y' | 'n')
            : 'y',
      },
      {
        onSuccess: (data) => {
          const isPhone = isPhoneNumber(selectedEmail ?? '')
          // For phone numbers the backend already returns a full descriptive
          // string in email_sent (e.g. "test SMS sent to +1…"), so use it
          // directly to avoid doubling up with our own prefix.
          const msg = data?.email_sent
            ? isPhone
              ? data.email_sent
              : `Test email sent to ${data.email_sent}`
            : isPhone
            ? 'SMS sent'
            : 'Test email sent'
          setSendTestStatus('success')
          setSendTestMessage(msg)
        },
        onError: () => {
          setSendTestStatus('error')
          const isPhone = isPhoneNumber(selectedEmail ?? '')
          setSendTestMessage(
            isPhone
              ? 'Could not send test text message. Please try again.'
              : 'Could not send test email. Please try again.'
          )
        },
      }
    )
  }

  const handleDeleteAll = async () => {
    if (!selectedEmail) return
    if (!confirm(`Delete all notification settings for ${selectedEmail}?`))
      return
    try {
      setIsDeleting(true)
      await axiosInstance!.delete('/ens', {
        params: { email: selectedEmail },
        headers: { Authorization: `Bearer ${token}` },
      })
      queryClient.removeQueries(['email', 'settings', selectedEmail])
      onClose?.()
    } catch {
      toast.error('Failed to delete notification settings. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  // ── extra email address management ───────────────────────────────────────
  const handleAddEmail = (newEmail: string) => {
    addExtraEmail(
      { email: accountEmail, addExtraEmails: newEmail },
      {
        onSuccess: () => {
          setShowAddEmail(false)
          setSelectedEmail(newEmail)
        },
        onError: () => {
          toast.error('Failed to add email address. Please try again.')
        },
      }
    )
  }

  const handleEditSaveAddress = (newEmail: string) => {
    updateEmailAddress(
      {
        email: accountEmail,
        extraEmail: selectedEmail,
        newExtraEmail: newEmail,
      },
      {
        onSuccess: () => {
          setShowEditEmail(false)
          setSelectedEmail(newEmail)
        },
        onError: () => {
          toast.error('Failed to update email address. Please try again.')
        },
      }
    )
  }

  const handleDeleteAddress = () => {
    if (!confirm(`Remove ${selectedEmail} from your notification addresses?`))
      return
    deleteEmailAddress(
      { email: accountEmail, extraEmail: selectedEmail },
      {
        onSuccess: () => {
          setShowEditEmail(false)
          setSelectedEmail(accountEmail)
        },
        onError: () => {
          toast.error('Failed to remove email address. Please try again.')
        },
      }
    )
  }

  // ── derived flags ────────────────────────────────────────────────────────
  const isDataLoading =
    isSiteConfigLoading || isSettingsLoading || isAddressesLoading
  const isBusy =
    isSaving ||
    isTesting ||
    isDeleting ||
    isAddingEmail ||
    isUpdatingEmail ||
    isDeletingEmail ||
    !selectedEmail ||
    isDataLoading

  const renderSelectedList = (names: string[]) => {
    if (names.length === 0)
      return <span className="text-stone-400">None selected</span>
    return <span>{names.join(', ')}</span>
  }

  return (
    <Modal
      title={<span className="text-2xl font-bold">Notifications</span>}
      onClose={onClose}
      open
      grayHeader
      headerClassName="!bg-secondary-300 !items-center"
      titleClassName="!pt-0 !mt-0"
      closeButtonClassName="!text-stone-700"
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
        {/* ── Email selector row ── */}
        <section className="flex items-center gap-2 pb-4">
          <span className="text-sm font-medium text-stone-600">
            Settings for:
          </span>

          {/* Custom dropdown — always opens downward, keyboard accessible */}
          <div ref={dropdownRef} className="relative">
            <button
              ref={triggerRef}
              aria-label="Select notification email address"
              className="flex min-w-[220px] items-center justify-between gap-2 rounded border border-stone-300 bg-white px-3 py-1 text-sm transition-colors hover:border-primary-400 hover:bg-blue-50 active:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => (dropdownOpen ? closeDropdown() : openDropdown())}
              onKeyDown={handleTriggerKeyDown}
              disabled={isAddressesLoading}
              aria-haspopup="listbox"
              aria-expanded={dropdownOpen}
              aria-controls="email-selector-listbox"
            >
              <span className="truncate">
                {selectedEmail || '—'}
                {selectedEmail === accountEmail ? (
                  <span className="ml-1 text-stone-400">(primary)</span>
                ) : null}
              </span>
              <svg
                className={`h-4 w-4 flex-shrink-0 text-stone-400 transition-transform ${
                  dropdownOpen ? 'rotate-180' : ''
                }`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {dropdownOpen && (
              <ul
                ref={listboxRef}
                id="email-selector-listbox"
                role="listbox"
                aria-label="Notification email address"
                tabIndex={-1}
                aria-activedescendant={
                  focusedIdx >= 0 ? `email-option-${focusedIdx}` : undefined
                }
                onKeyDown={handleDropdownKeyDown}
                className="absolute left-0 top-full z-50 mt-1 max-h-60 w-full overflow-auto rounded border border-stone-200 bg-white shadow-lg outline-none"
              >
                {allEmails.map((e, idx) => (
                  <li
                    key={e}
                    id={`email-option-${idx}`}
                    role="option"
                    aria-selected={e === selectedEmail}
                    className={`cursor-pointer px-3 py-2 text-sm transition-colors ${
                      e === selectedEmail
                        ? 'bg-yellow-50 font-semibold text-primary-700'
                        : idx === focusedIdx
                        ? 'bg-blue-100 text-primary-700'
                        : 'text-stone-700 hover:bg-blue-50 hover:text-primary-700 active:bg-blue-100'
                    }`}
                    onMouseEnter={() => setFocusedIdx(idx)}
                    onClick={() => {
                      setSelectedEmail(e)
                      closeDropdown()
                    }}
                  >
                    {e === selectedEmail && (
                      <span className="mr-1 text-primary-500">›</span>
                    )}
                    {e}
                    {e === accountEmail && (
                      <span className="ml-1 text-xs font-normal text-stone-400">
                        (primary)
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Pencil — always visible; disabled + tooltip explains why for primary.
              Wrapped in <span> so Tippy fires even when the button is disabled. */}
          <Tippy
            content={
              isExtraEmail
                ? 'Edit or delete this destination'
                : 'Primary email address cannot be edited here'
            }
            placement="top"
          >
            <span className="inline-flex">
              <button
                className="flex h-7 w-7 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-500 transition-colors hover:border-primary-500 hover:bg-blue-100 hover:text-primary-600 active:bg-blue-200 disabled:cursor-not-allowed disabled:opacity-40"
                onClick={() => isExtraEmail && setShowEditEmail(true)}
                disabled={isBusy || !isExtraEmail}
                aria-label="Edit address"
              >
                <FontAwesomeIcon icon={faPencil} className="text-xs" />
              </button>
            </span>
          </Tippy>

          {/* Plus — add a new address. Wrapped in <span> so Tippy fires when disabled. */}
          <Tippy content="Add a notification destination" placement="top">
            <span className="inline-flex">
              <button
                className="flex h-7 w-7 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-500 transition-colors hover:border-primary-500 hover:bg-blue-100 hover:text-primary-600 active:bg-blue-200 disabled:cursor-not-allowed disabled:opacity-40"
                onClick={() => setShowAddEmail(true)}
                disabled={isBusy}
                aria-label="Add address"
              >
                <FontAwesomeIcon icon={faPlus} className="text-xs" />
              </button>
            </span>
          </Tippy>

          {/* Make Default checkbox — shown for extra destinations only */}
          {isExtraEmail &&
            (() => {
              const selType = isPhoneNumber(selectedEmail ?? '')
                ? 'phone'
                : 'email'
              const isAlreadyDefault = defaultDestType === selType
              return (
                <label className="ml-2 flex cursor-pointer items-center gap-1.5 text-xs text-stone-600">
                  <input
                    type="checkbox"
                    checked={isAlreadyDefault}
                    disabled={isAlreadyDefault || isBusy}
                    onChange={() => {
                      saveDefaultDestType(selType)
                      setDefaultDestType(selType)
                    }}
                    className="accent-teal-600 disabled:cursor-default"
                  />
                  Make default
                </label>
              )
            })()}
        </section>

        {/* ── Plain text + test send row ── */}
        <section className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-2">
            {!isPhoneNumber(selectedEmail ?? '') && (
              <>
                <span id="plain-text-label" className="text-sm font-medium">
                  Send emails as plain text
                </span>
                {/* Toggle slider */}
                <button
                  role="switch"
                  aria-labelledby="plain-text-label"
                  aria-checked={plainText}
                  disabled={isDataLoading}
                  onClick={() => setPlainText((v) => !v)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 ${
                    plainText ? 'bg-primary-600' : 'bg-stone-300'
                  }`}
                >
                  <span className="sr-only">{plainText ? 'On' : 'Off'}</span>
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      plainText ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span
                  className={`text-xs font-semibold ${
                    plainText ? 'text-primary-600' : 'text-stone-400'
                  }`}
                >
                  {plainText ? 'On' : 'Off'}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {sendTestStatus === 'success' && (
              <span className="text-sm text-green-600">
                {sendTestMessage ||
                  (isPhoneNumber(selectedEmail ?? '')
                    ? 'SMS sent'
                    : `Test email sent to ${selectedEmail}`)}
              </span>
            )}
            {sendTestStatus === 'error' && (
              <span className="text-sm text-red-600">
                Failed: {sendTestMessage || 'Unknown error'}
              </span>
            )}
            <Tippy
              content={
                isPhoneNumber(selectedEmail ?? '')
                  ? `Send a test text message to ${selectedEmail}`
                  : `Send a test email to ${selectedEmail}`
              }
              placement="top"
            >
              <span>
                <Button
                  appearance="secondary"
                  onClick={handleSendTest}
                  disabled={isBusy}
                >
                  {isTesting
                    ? 'Sending…'
                    : isPhoneNumber(selectedEmail ?? '')
                    ? 'Send test text'
                    : 'Send test email'}
                </Button>
              </span>
            </Tippy>
          </div>
        </section>

        {/* ── Receive All Notifications ── */}
        <section className="-mx-4 border-t p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-bold">Receive All Notifications</span>
            <Tippy
              content="Choose which vehicles send you all notifications"
              placement="top"
            >
              <span>
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
              </span>
            </Tippy>
          </div>
          <div className="overflow-auto rounded border bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary-300">
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

        {/* ── Receive Filtered Notifications ── */}
        <section className="-mx-4 border-t p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-bold">Receive Filtered Notifications</span>
            <Tippy
              content="Add a new filtered notification rule"
              placement="top"
            >
              <span>
                <Button
                  appearance="secondary"
                  onClick={() => setEditModal({ idx: -1 })}
                >
                  Add filtered notification
                </Button>
              </span>
            </Tippy>
          </div>

          <div className="overflow-auto rounded border bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary-300">
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
                        className="cursor-pointer border-b align-top text-stone-600 transition-colors hover:bg-secondary-100 active:bg-secondary-200"
                        title="Click to edit this filter rule"
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

      {/* ── Sub-dialogs ── */}
      {showAddEmail && (
        <AddEmailDialog
          existingEmails={allEmails}
          onClose={() => setShowAddEmail(false)}
          onAdd={handleAddEmail}
          isAdding={isAddingEmail}
        />
      )}

      {showEditEmail && (
        <EditEmailDialog
          currentEmail={selectedEmail}
          existingEmails={allEmails}
          onClose={() => setShowEditEmail(false)}
          onSave={handleEditSaveAddress}
          onDelete={handleDeleteAddress}
          isSaving={isUpdatingEmail}
          isDeleting={isDeletingEmail}
        />
      )}

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
