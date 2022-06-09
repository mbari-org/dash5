import React, { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import {
  useDefaultValueListener,
  FormProps,
  ErrorMap,
} from '@sumocreations/forms'
import { camelCase } from 'lodash'

// Assumes we have some existing UI implementation for forms in our library. Replace as needed.
import { TextField, Fields, ErrorList } from '../Fields'
import { Button } from '../Navigation'
import { AbsoluteOverlay } from '../Indicators'

export type CreateAccountFormValues = {
  email?: string
  firstName?: string
  lastName?: string
  password?: string
  confirmPassword?: string
  requestOperator?: boolean
}

const schema = yup.object({
  email: yup.string().required('Cannot be blank'),
  firstName: yup.string().required('Cannot be blank'),
  lastName: yup.string().required('Cannot be blank'),
  password: yup.string().required('Cannot be blank'),
  confirmPassword: yup
    .string()
    .required('Cannot be blank')
    .oneOf([yup.ref('password'), null], 'Passwords must match'),
  requestOperator: yup.boolean(),
})

export interface CreateAccountFormProps
  extends FormProps<CreateAccountFormValues> {
  loading?: boolean
}

export const CreateAccountForm: React.FC<CreateAccountFormProps> = ({
  onSubmit: externalSubmitHandler,
  loading,
  defaultValues,
  submitTitle,
  hideSubmit,
  id,
}) => {
  const {
    handleSubmit,
    register,
    formState: { errors: formErrors },
    setError,
    reset,
  } = useForm<CreateAccountFormValues>({
    resolver: yupResolver(schema),
    mode: 'onBlur',
  })

  console.log(formErrors)

  useDefaultValueListener<CreateAccountFormValues>(defaultValues, reset)

  const handleFormSubmit = handleSubmit(async (data) => {
    const { errors = {} } = (await externalSubmitHandler(data)) ?? {}
    const keys = Object.keys(errors)
    if (keys.length) {
      keys.map((key) =>
        setError(camelCase(key) as keyof CreateAccountFormValues, {
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
      <Fields
        register={register}
        errors={formErrors}
        grow
        className="grid w-full grid-cols-2 grid-rows-4 gap-x-2 gap-y-4 pb-2"
      >
        <TextField
          name="email"
          label="Email"
          ref={field}
          className="w-full"
          labelClassName="text-gray-500 font-medium"
          materialDesign
        />
        <div />
        <TextField
          name="firstName"
          label="First Name:"
          type="text"
          className="w-full"
          labelClassName="text-gray-500 font-medium"
          materialDesign
        />
        <TextField
          name="lastName"
          label="Last Name:"
          type="text"
          className="w-full"
          labelClassName="text-gray-500 font-medium"
          materialDesign
        />
        <TextField
          name="password"
          label="Password:"
          type="password"
          className="w-full"
          labelClassName="text-gray-500 font-medium"
          materialDesign
        />
        <TextField
          name="confirmPassword"
          label="Re-enter password:"
          type="password"
          className="w-full"
          labelClassName="text-gray-500 font-medium"
          materialDesign
        />
        <div className="flex flex-row items-center">
          <label htmlFor="requestOperator" className="mr-2 text-sm font-medium">
            Request operator role:
          </label>
          <input
            type="checkbox"
            id="requestOperator"
            {...register('requestOperator')}
          />{' '}
        </div>
        <ErrorList errors={formErrors as ErrorMap} />
        {!hideSubmit ? (
          <Button type="submit" className="mt-2 w-full">
            {submitTitle ?? 'Create Account'}
          </Button>
        ) : null}
      </Fields>
      {loading ? <AbsoluteOverlay /> : null}
    </form>
  )
}

CreateAccountForm.displayName = 'Forms.CreateAccountForm'
