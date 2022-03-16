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

export type LoginValues = {
  email: string
  password: string
}

const schema = yup.object({
  email: yup.string().required('cannot be blank'),
  password: yup.string().required('cannot be blank'),
})

export interface LoginProps extends FormProps<LoginValues> {
  loading?: boolean
  hasAgreedToTerms?: (agreed: boolean) => void
}

export const Login: React.FC<LoginProps> = ({
  onSubmit: externalSubmitHandler,
  loading,
  defaultValues,
  submitTitle,
}) => {
  const {
    handleSubmit,
    register,
    formState: { errors: formErrors },
    setError,
    reset,
  } = useForm<LoginValues>({
    resolver: yupResolver(schema),
    mode: 'onBlur',
  })

  useDefaultValueListener<LoginValues>(defaultValues, reset)

  const handleFormSubmit = handleSubmit(async (data) => {
    const { errors = {} } = (await externalSubmitHandler(data)) ?? {}
    const keys = Object.keys(errors)
    if (keys.length) {
      keys.map((key) =>
        setError(camelCase(key) as keyof LoginValues, {
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
    <form onSubmit={handleFormSubmit} className="relative">
      <Fields register={register} errors={formErrors} grow className="pb-2">
        <TextField
          name="email"
          label="Email"
          placeholder="Email Address"
          ref={field}
          className="w-full"
        />
        <TextField
          name="password"
          label="Password"
          placeholder="Password"
          type="password"
          className="w-full"
        />
        <ErrorList errors={formErrors as ErrorMap} />
        <Button type="submit" className="mt-2 w-full">
          {submitTitle ?? 'Submit Form'}
        </Button>
      </Fields>
      {loading ? <AbsoluteOverlay /> : null}
    </form>
  )
}
