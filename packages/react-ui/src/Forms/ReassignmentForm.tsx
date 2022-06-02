import React, { useEffect, useRef } from 'react'
import { Controller, useForm, UseFormRegister } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import clsx from 'clsx'
import {
  useDefaultValueListener,
  FormProps,
  ErrorMap,
} from '@sumocreations/forms'
import { camelCase } from 'lodash'

// Assumes we have some existing UI implementation for forms in our library. Replace as needed.
import { Fields, ErrorList, SelectField } from '../Fields'
import { Button } from '../Navigation'
import { AbsoluteOverlay } from '../Indicators'
import { truncate } from 'fs'

type Common = {
  id: string
  name: string
}

type PIC = Common

export type PICs = PIC[]

type OnCall = Common

export type OnCalls = OnCall[]

type Vehicle = {
  vehicleId: number
  vehicleName: string
  pic: string
  onCall: string
}

export type Vehicles = Vehicle[]

export type ReassignmentFormValues = {
  vehicleName: string
  pic: string
  onCall: string
}

const schema = yup.object({
  vehicleName: yup.array().of(yup.string()).required('cannot be blank'),
  pic: yup.string().required('cannot be blank'),
  onCall: yup.string().required('cannot be blank'),
})

export interface ReassignmentFormProps
  extends FormProps<ReassignmentFormValues> {
  loading?: boolean
  vehicles?: Vehicles
  pics?: PICs
  onCalls?: OnCalls
  disableOnCalls?: boolean
  disablePics?: boolean
}

export const ReassignmentForm: React.FC<ReassignmentFormProps> = ({
  onSubmit: externalSubmitHandler,
  loading,
  defaultValues,
  submitTitle,
  hideSubmit,
  vehicles,
  pics,
  onCalls,
  id,
  disableOnCalls = false,
  disablePics = false,
}) => {
  const {
    handleSubmit,
    register,
    formState: { errors: formErrors },
    setError,
    reset,
    control,
  } = useForm<ReassignmentFormValues>({
    resolver: yupResolver(schema),
    mode: 'onBlur',
  })

  useDefaultValueListener<ReassignmentFormValues>(defaultValues, reset)

  const handleFormSubmit = handleSubmit(async (data) => {
    const { errors = {} } = (await externalSubmitHandler(data)) ?? {}
    const keys = Object.keys(errors)
    if (keys.length) {
      keys.map((key) =>
        setError(camelCase(key) as keyof ReassignmentFormValues, {
          message: errors[key],
        })
      )
    }
  })

  const field = useRef<HTMLInputElement>(null)

  useEffect(() => {
    field.current?.focus()
  })

  return (
    <form onSubmit={handleFormSubmit} className="relative" id={id}>
      <Fields register={register} errors={formErrors} grow className="pb-2">
        <div className="mb-4 flex w-full flex-col gap-2">
          {vehicles?.map(({ vehicleId, vehicleName, pic, onCall }) => (
            <Vehicle
              pic={pic}
              onCall={onCall}
              register={register}
              vehicleId={vehicleId}
              vehicleName={vehicleName}
              key={`${vehicleName}_${pic}_${onCall}_${vehicleId}`}
            />
          ))}
        </div>
        <div className="grid w-full grid-cols-2 grid-rows-1 gap-x-12">
          <div>
            <Controller
              control={control}
              name="pic"
              render={({ field, fieldState: { error } }) => (
                <SelectField
                  placeholder="Search"
                  label="Reassign PIC to:"
                  labelClassName={clsx('font-medium text-base', {
                    'text-gray-300': disablePics,
                  })}
                  options={pics}
                  selfControllable
                  {...field}
                  onSelect={field.onChange}
                  errorMessage={error?.message}
                  disabled={disablePics}
                />
              )}
            />
          </div>
          <div>
            <Controller
              control={control}
              name="onCall"
              render={({ field, fieldState: { error } }) => (
                <SelectField
                  placeholder="Search"
                  label="Reassign on-call to:"
                  labelClassName={clsx('font-medium text-base', {
                    'text-gray-300': disableOnCalls,
                  })}
                  options={onCalls}
                  selfControllable
                  {...field}
                  onSelect={field.onChange}
                  errorMessage={error?.message}
                  disabled={disableOnCalls}
                />
              )}
            />
          </div>
        </div>
        <ErrorList errors={formErrors as ErrorMap} />
        {!hideSubmit ? (
          <Button type="submit" className="mt-2 w-full">
            {submitTitle ?? 'Submit Form'}
          </Button>
        ) : null}
      </Fields>
      {loading ? <AbsoluteOverlay /> : null}
    </form>
  )
}

interface VehicleProps {
  vehicleId: number
  vehicleName: string
  pic: string
  onCall: string
  register: UseFormRegister<ReassignmentFormValues>
}

const Vehicle: React.FC<VehicleProps> = ({
  pic,
  onCall,
  register,
  vehicleId,
  vehicleName,
}) => (
  <div className="grid grid-cols-3 grid-rows-1 items-center gap-2">
    <div>
      <label htmlFor={`${vehicleName}_${vehicleId}`} className="text-sm">
        <input
          type="checkbox"
          id={`${vehicleName}_${vehicleId}`}
          value={vehicleId}
          {...register('vehicleName')}
        />{' '}
        <span className="ml-1 text-lg font-medium">{vehicleName}</span>
      </label>
    </div>
    <div className="flex flex-wrap text-sm text-gray-500">
      <p className="mr-2">PIC:</p>
      <p>{pic}</p>
    </div>
    <div className="flex flex-wrap text-sm text-gray-500">
      <p className="mr-2">On-call:</p>
      <p>{onCall}</p>
    </div>
  </div>
)

ReassignmentForm.displayName = 'Forms.ReassignmentForm'
