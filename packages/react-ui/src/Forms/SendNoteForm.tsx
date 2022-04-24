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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faExclamationTriangle,
  faEdit,
} from '@fortawesome/pro-regular-svg-icons'

// Assumes we have some existing UI implementation for forms in our library. Replace as needed.
import { TextAreaField, Fields, ErrorList } from '../Fields'
import { Button } from '../Navigation'
import { AbsoluteOverlay } from '../Indicators'
import { IconProp } from '@fortawesome/fontawesome-svg-core'

export type SendNoteFormValues = {
  note: string
  bugReport?: boolean
  critical?: boolean
}

const schema = yup.object({
  note: yup.string().required('cannot be blank'),
  bugReport: yup.boolean(),
  critical: yup.boolean(),
})

export interface SendNoteFormProps extends FormProps<SendNoteFormValues> {
  loading?: boolean
}

const text =
  'This note will also go to the #lrauvs channel in Slack. Additional channels can be indicated by enclosing them in curly brackets at the beginning of the note, for example, {#wavegilder, @johndoe}... Make sure these Slack names are spelled correctly as they are not validated here.'

export const SendNoteForm: React.FC<SendNoteFormProps> = ({
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
  } = useForm<SendNoteFormValues>({
    resolver: yupResolver(schema),
    mode: 'onBlur',
  })

  useDefaultValueListener<SendNoteFormValues>(defaultValues, reset)

  const handleFormSubmit = handleSubmit(async (data) => {
    const { errors = {} } = (await externalSubmitHandler(data)) ?? {}
    const keys = Object.keys(errors)
    if (keys.length) {
      keys.map((key) =>
        setError(camelCase(key) as keyof SendNoteFormValues, {
          message: errors[key],
        })
      )
    }
  })

  return (
    <form onSubmit={handleFormSubmit} className="relative" id={id}>
      <Fields register={register} errors={formErrors} grow className="pb-2">
        <div className="relative flex w-full flex-row items-baseline">
          <div className="flex-1">
            <TextAreaField
              label="Enter your note"
              className="w-full"
              required
              {...register('note')}
            />
          </div>

          <div className="absolute right-0 -top-2">
            <button className="flex items-center justify-center rounded-md border p-2">
              <FontAwesomeIcon icon={faEdit as IconProp} />
            </button>
          </div>
        </div>
        <label htmlFor="bugReport">
          <input type="checkbox" id="bugReport" {...register('bugReport')} />{' '}
          Bug Report
        </label>
        <label htmlFor="critical">
          <input type="checkbox" id="critical" {...register('critical')} />{' '}
          Critical
          <span className="ml-2 text-red-600">
            <FontAwesomeIcon icon={faExclamationTriangle as IconProp} />
          </span>
        </label>
        <ErrorList errors={formErrors as ErrorMap} />
        <p className="text-xs text-gray-500">{text}</p>
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

SendNoteForm.displayName = 'Forms.SendNote'
