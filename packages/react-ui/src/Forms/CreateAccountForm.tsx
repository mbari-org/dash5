import React from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import {
  useDefaultValueListener,
  FormProps,
  ErrorMap,
} from '@sumocreations/forms'
import { camelCase } from 'lodash'
import { faEnvelope, faEyeSlash } from '@fortawesome/pro-regular-svg-icons'

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

  return (
    <form onSubmit={handleFormSubmit} className="relative" id={id}>
      <Fields register={register} errors={formErrors} grow>
        <TextField
          name="email"
          label="Email"
          placeholder="Email Address"
          className="w-full opacity-60"
          icon={faEnvelope}
        />
        <Fields nested grow>
          <TextField
            name="firstName"
            label="First Name:"
            className="w-full"
            labelClassName="text-gray-500 font-medium"
          />
          <TextField
            name="lastName"
            label="Last Name:"
            className="w-full"
            labelClassName="text-gray-500 font-medium"
          />
        </Fields>
        <TextField
          name="password"
          label="Password"
          placeholder="Password"
          type="password"
          className="w-full opacity-60"
          icon={faEyeSlash}
        />
        <TextField
          name="confirmPassword"
          label="Re-enter password:"
          placeholder="Password"
          type="password"
          className="w-full opacity-60"
          icon={faEyeSlash}
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
