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
import toast from 'react-hot-toast'

interface PendingSignOff {
  vehicleName: string
  hours: string
}

/** Convert decimal hours to ISO 8601 duration, e.g. 8.5 → "PT8H30M".
 *  Returns PT0H0M for an explicit 0 so the backend records a zero-duration shift.
 *  Returns undefined for empty/invalid input as a safety fallback (the UI
 *  prevents submission while the field is blank). */
const toWatchDuration = (hours: string): string | undefined => {
  if (hours.trim() === '') return undefined
  const h = Number(hours)
  if (!Number.isFinite(h) || h < 0) return undefined
  let hours = Math.floor(h)
  let minutes = Math.round((h - hours) * 60)
  if (minutes === 60) {
    hours += 1
    minutes = 0
  }
  return `PT${hours}H${minutes}M`
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
    if (!pendingSignOff || pendingSignOff.hours.trim() === '') return null
    const h = Number(pendingSignOff.hours)
    if (!Number.isFinite(h)) return 'Please enter a valid number'
    if (h < 0) return 'Hours cannot be negative'
    if (h > 24) return 'A single watch cannot exceed 24 hours'
    return null
  }, [pendingSignOff])

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

    // For PIC sign-off only, prompt for active hours piloted before submitting.
    if (isPic && roleChangeType === 'off') {
      setPendingSignOff({ vehicleName, hours: '' })
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
        title="Confirm"
        titleClassName="text-xl font-semibold"
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
        disableConfirm={!!hoursError || pendingSignOff?.hours.trim() === ''}
      >
        {pendingSignOff && (
          <div className="flex flex-col gap-3">
            <p className="text-base text-gray-700">
              You are signing off as <span className="font-semibold">PIC</span>{' '}
              for vehicle{' '}
              <span className="font-semibold">
                {pendingSignOff.vehicleName}
              </span>
              .
            </p>
            <p className="text-base text-gray-700">
              During this PIC shift for this vehicle, please estimate the time
              you spent actively piloting. Enter your estimate in decimal hours,
              for example, enter <code className="font-mono">2.5</code> to
              indicate 2 hours and 30 minutes.
            </p>
            <p className="text-base text-gray-700">
              Not an actual shift? Just enter{' '}
              <code className="font-mono">0</code> (zero).
            </p>
            <div className="flex flex-col gap-1">
              <label htmlFor="pic-hours" className="text-base text-gray-600">
                Hours actively piloted
              </label>
              <input
                id="pic-hours"
                type="number"
                min="0"
                max="24"
                step="0.5"
                value={pendingSignOff.hours}
                onChange={(e) =>
                  setPendingSignOff({
                    ...pendingSignOff,
                    hours: e.target.value,
                  })
                }
                className="w-full rounded border border-gray-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
                autoFocus
              />
              {hoursError && (
                <p className="text-xs text-red-500">{hoursError}</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}

ReassignmentModal.displayName = 'Dash2.Components.Reassignment'

export default Reassignment
