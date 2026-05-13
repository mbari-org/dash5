import React, { useState } from 'react'
import {
  useVehiclePicAndOnCall,
  useAssignPicAndOnCall,
  useCreateNote,
} from '@mbari/api-client'
import {
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
  const { mutate: createNote } = useCreateNote()

  // When signing off as PIC, capture the vehicle name and prompt for hours.
  const [pendingSignOff, setPendingSignOff] = useState<PendingSignOff | null>(
    null
  )

  const doSignOff = (vehicleName: string, hours: string) => {
    if (!profile?.email) return
    assignPicAndOnCall(
      {
        vehicleName: vehicleName.toLowerCase(),
        email: profile.email,
        sign: 'off',
        subRole: 'PIC',
      },
      {
        onSuccess: () => {
          toast.success(`Successfully signed off as PIC for ${vehicleName}`)
          queryClient.invalidateQueries(['users', 'picAndOnCall'])
          queryClient.invalidateQueries(['users', 'role'])

          const h = parseFloat(hours)
          if (!isNaN(h) && h > 0) {
            createNote(
              {
                vehicle: vehicleName.toLowerCase(),
                note: `PIC watchstanding: ${h}h`,
              },
              {
                onError: () =>
                  toast.error(
                    'Signed off, but could not record piloting hours'
                  ),
              }
            )
          }
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
    if (isPic && roleChangeType === 'off') {
      setPendingSignOff({ vehicleName, hours: '8' })
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
      picOperators: v.pics.map((pic) => pic.user),
      onCallOperators: v.onCalls.map((onCall) => onCall.user),
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

      {pendingSignOff && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pic-signoff-title"
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40"
        >
          <div className="w-80 rounded-lg bg-white p-6 shadow-xl">
            <h2
              id="pic-signoff-title"
              className="mb-4 text-base font-semibold text-gray-800"
            >
              Sign off as PIC — {pendingSignOff.vehicleName}
            </h2>
            <label
              htmlFor="pic-hours"
              className="mb-1 block text-sm text-gray-600"
            >
              Hours piloted <span className="text-gray-400">(optional)</span>
            </label>
            <input
              id="pic-hours"
              type="number"
              min="0"
              step="0.5"
              value={pendingSignOff.hours}
              onChange={(e) =>
                setPendingSignOff({ ...pendingSignOff, hours: e.target.value })
              }
              className="mb-5 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPendingSignOff(null)}
                className="rounded px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  doSignOff(pendingSignOff.vehicleName, pendingSignOff.hours)
                  setPendingSignOff(null)
                }}
                className="rounded bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
              >
                Sign off
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

ReassignmentModal.displayName = 'Dash2.Components.Reassignment'

export default Reassignment
