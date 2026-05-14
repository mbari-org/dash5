import React, { useMemo, useState } from 'react'
import {
  useVehiclePicAndOnCall,
  useAssignPicAndOnCall,
} from '@mbari/api-client'
import {
  Modal,
  ReassignmentModal,
  ReassignmentTableProps,
  RoleChangeType,
} from '@mbari/react-ui'

import useGlobalModalId from '../lib/useGlobalModalId'
import { capitalize } from '@mbari/utils'
import { useQueryClient } from 'react-query'
import { useTethysApiContext } from '@mbari/api-client'
import { DateTime } from 'luxon'
import toast from 'react-hot-toast'

interface PendingSignOff {
  vehicleName: string
  hours: string
}

/** Convert decimal hours to ISO 8601 duration, e.g. 8.5 → "PT8H30M" */
const toWatchDuration = (hours: string): string | undefined => {
  const h = parseFloat(hours)
  if (isNaN(h) || h <= 0) return undefined
  const wholeHours = Math.floor(h)
  const minutes = Math.round((h - wholeHours) * 60)
  return `PT${wholeHours}H${minutes}M`
}

const Reassignment: React.FC<{ vehicleNames: string[] }> = ({
  vehicleNames,
}) => {
  const queryClient = useQueryClient()
  const { data, isLoading } = useVehiclePicAndOnCall({
    vehicleName: vehicleNames,
  })
  const { setGlobalModalId } = useGlobalModalId()
  const { profile } = useTethysApiContext()
  const currentUserName = profile
    ? `${profile.firstName} ${profile.lastName}`
    : ''

  const handleClose = () => setGlobalModalId(null)

  const { mutate: assignPicAndOnCall, isLoading: loadingAssignPicAndOnCall } =
    useAssignPicAndOnCall()

  // When signing off as PIC, capture the vehicle name and prompt for hours.
  const [pendingSignOff, setPendingSignOff] = useState<PendingSignOff | null>(
    null
  )

  const hoursError = useMemo(() => {
    if (!pendingSignOff || pendingSignOff.hours === '') return null
    const h = parseFloat(pendingSignOff.hours)
    if (isNaN(h)) return 'Please enter a valid number'
    if (h < 0) return 'Hours cannot be negative'
    if (h > 24) return 'A single watch cannot exceed 24 hours'
    return null
  }, [pendingSignOff])

  /** Round elapsed ms to the nearest 0.5h, formatted as a string. */
  const elapsedHours = (sinceMs: number): string => {
    const raw = sinceMs / 3_600_000
    return (Math.round(raw * 2) / 2).toFixed(1).replace(/\.0$/, '')
  }

  const doSignOff = (vehicleName: string, hours: string) => {
    if (!profile?.email) return
    assignPicAndOnCall(
      {
        vehicleName: vehicleName.toLowerCase(),
        email: profile.email,
        sign: 'off',
        subRole: 'PIC',
        watchDuration: toWatchDuration(hours),
      },
      {
        onSuccess: () => {
          toast.success(`Successfully signed off as PIC for ${vehicleName}`)
          queryClient.invalidateQueries(['users', 'picAndOnCall'])
          queryClient.invalidateQueries(['users', 'role'])
        },
        onError: () => {
          toast.error(`Failed to sign off as PIC for ${vehicleName}`)
        },
      }
    )
  }

  const handleRoleChange = (
    vehicleName: string,
    roleChangeType: RoleChangeType,
    isPic: boolean
  ) => {
    if (!profile?.email) return

    // For PIC sign-off only, prompt for hours piloted before submitting.
    // Pre-fill with actual elapsed time since sign-in, rounded to nearest 0.5h.
    if (isPic && roleChangeType === 'off') {
      const vehicleData = data?.find(
        (v) => v.vehicleName.toLowerCase() === vehicleName.toLowerCase()
      )
      const picEntry = vehicleData?.pics.find((p) => p.user === currentUserName)
      // Leave blank if sign-in time is unavailable — avoid fabricating a duration.
      const hours = picEntry
        ? elapsedHours(DateTime.now().toMillis() - picEntry.unixTime)
        : ''
      setPendingSignOff({ vehicleName, hours })
      return
    }

    assignPicAndOnCall(
      {
        vehicleName: vehicleName.toLowerCase(),
        email: profile.email,
        sign: roleChangeType,
        subRole: isPic ? 'PIC' : 'On-Call',
      },
      {
        onSuccess: () => {
          toast.success(
            `Successfully ${
              roleChangeType === 'in' ? 'signed in' : 'signed off'
            } as ${isPic ? 'PIC' : 'On-Call'} for ${vehicleName}`
          )
          queryClient.invalidateQueries(['users', 'picAndOnCall'])
          queryClient.invalidateQueries(['users', 'role'])
        },
        onError: () => {
          toast.error(
            `Failed to ${roleChangeType === 'in' ? 'sign in' : 'sign off'} as ${
              isPic ? 'PIC' : 'On-Call'
            } for ${vehicleName}`
          )
        },
      }
    )
  }

  const vehicleData: ReassignmentTableProps['vehicles'] =
    data?.map((v) => ({
      name: capitalize(v.vehicleName),
      picOperators: v.pics.map((pic) => ({
        user: pic.user,
        unixTime: pic.unixTime,
      })),
      onCallOperators: v.onCalls.map((onCall) => ({
        user: onCall.user,
        unixTime: onCall.unixTime,
      })),
    })) || []

  return (
    <>
      <ReassignmentModal
        onClose={handleClose}
        vehicles={vehicleData}
        currentUserName={currentUserName}
        onRoleChange={handleRoleChange}
        isLoading={isLoading || loadingAssignPicAndOnCall}
        open
      />

      <Modal
        title={`Sign off as PIC — ${pendingSignOff?.vehicleName ?? ''}`}
        open={!!pendingSignOff}
        zIndex="z-[9999]"
        onClose={() => setPendingSignOff(null)}
        onCancel={() => setPendingSignOff(null)}
        onConfirm={() => {
          if (!pendingSignOff) return
          doSignOff(pendingSignOff.vehicleName, pendingSignOff.hours)
          setPendingSignOff(null)
        }}
        confirmButtonText="Sign off"
        cancelButtonText="Cancel"
        disableConfirm={!!hoursError}
      >
        {pendingSignOff && (
          <div className="flex flex-col gap-1">
            <label htmlFor="pic-hours" className="text-sm text-gray-600">
              Hours piloted <span className="text-gray-400">(optional)</span>
            </label>
            <input
              id="pic-hours"
              type="number"
              min="0"
              max="24"
              step="0.5"
              value={pendingSignOff.hours}
              onChange={(e) =>
                setPendingSignOff({ ...pendingSignOff, hours: e.target.value })
              }
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              autoFocus
            />
            {hoursError && <p className="text-xs text-red-500">{hoursError}</p>}
          </div>
        )}
      </Modal>
    </>
  )
}

ReassignmentModal.displayName = 'Dash2.Components.Reassignment'

export default Reassignment
