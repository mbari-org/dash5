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

// Assumes we have some existing UI implementation for forms in our library. Replace as needed.
import { TextAreaField, Fields, ErrorList } from '../Fields'
import { Button } from '../Navigation'
import { AbsoluteOverlay } from '../Indicators'

export type SendNoteValues = {
  note: string
  bugReport?: boolean
  critical?: boolean
}

const schema = yup.object({
  note: yup.string().required('cannot be blank'),
  bugReport: yup.boolean(),
  critical: yup.boolean(),
})

export interface SendNoteProps extends FormProps<SendNoteValues> {
  loading?: boolean
}

export const SendNote: React.FC<SendNoteProps> = ({
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
  } = useForm<SendNoteValues>({
    resolver: yupResolver(schema),
    mode: 'onBlur',
  })

  useDefaultValueListener<SendNoteValues>(defaultValues, reset)

  const handleFormSubmit = handleSubmit(async (data) => {
    const { errors = {} } = (await externalSubmitHandler(data)) ?? {}
    const keys = Object.keys(errors)
    if (keys.length) {
      keys.map((key) =>
        setError(camelCase(key) as keyof SendNoteValues, {
          message: errors[key],
        })
      )
    }
  })

  return (
    <form onSubmit={handleFormSubmit} className="relative" id={id}>
      <Fields register={register} errors={formErrors} grow className="pb-2">
        <TextAreaField
          name="note"
          label="Enter your note"
          className="w-full"
          required
        />
        <label htmlFor="bugReport">
          <input type="checkbox" id="bugReport" {...register('bugReport')} />{' '}
          Bug Report
        </label>
        <label htmlFor="critical">
          <input type="checkbox" id="critical" {...register('critical')} />{' '}
          Critical
        </label>
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

SendNote.displayName = 'Forms.SendNote'
