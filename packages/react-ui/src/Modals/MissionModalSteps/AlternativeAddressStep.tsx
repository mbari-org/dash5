import { TextArea } from '../../Fields/TextArea'
import React, { useState } from 'react'

export interface AlternativeAddressProps {
  vehicleName: string
  mission: string
  alternativeAddresses?: string[]
  onNotesChanged?: (notes: string) => void
  onAlternativeAddressChanged?: (address: string) => void
  notes?: string | null
  alternateAddress?: string | null
}

export const AlternativeAddressStep: React.FC<AlternativeAddressProps> = ({
  vehicleName,
  mission,
  alternativeAddresses = [],
  alternateAddress = null,
  notes = null,
  onNotesChanged,
  onAlternativeAddressChanged,
}) => {
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onNotesChanged?.(e.target.value)
  }

  const handleAlternateAddressChange = (address: string) => () => {
    onAlternativeAddressChanged?.(address)
  }

  return (
    <article className="h-full">
      <section className="mx-4 mb-6">
        Select alternate address to schedule{' '}
        <span className="text-teal-500" data-testid="mission name">
          {mission}
        </span>{' '}
        mission for{' '}
        <span className="text-teal-500" data-testid="mission name">
          {vehicleName}
        </span>
      </section>
      <ul className="ml-4 -mt-1 flex max-h-full flex-col">
        {alternativeAddresses?.map((address) => (
          <li className="mr-4 flex" key={address}>
            <label
              htmlFor="scheduleMethod"
              className="py-1"
              onClick={handleAlternateAddressChange(address)}
            >
              <input
                type="radio"
                value={address}
                name="scheduleMethod"
                checked={alternateAddress === address}
                className="mr-2"
              />
              {address}
            </label>
          </li>
        )) ?? <li className="mr-4 flex">No alternate addresses available</li>}
      </ul>
      <section className="mx-4 mt-4 flex flex-col">
        <label>Notes (will appear in log)</label>
        <TextArea
          name="notes"
          className="max-w-xs"
          onChange={handleNotesChange}
          value={notes ?? ''}
        />
      </section>
    </article>
  )
}
