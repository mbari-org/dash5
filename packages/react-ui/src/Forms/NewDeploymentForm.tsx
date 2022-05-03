import React, { useCallback, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import {
  useDefaultValueListener,
  FormProps,
  ErrorMap,
} from '@sumocreations/forms'
import { camelCase } from 'lodash'
import { DateTime } from 'luxon'
import { zones } from 'tzdata'
import { TextField, Fields, ErrorList, SelectField, DateField } from '../Fields'
import { Button } from '../Navigation'
import { AbsoluteOverlay } from '../Indicators'
import { SelectOption } from '../Fields/Select'

const luxonValidTimezones = [
  ...new Set(
    Object.keys(zones)
      .filter((tz) => tz.includes('/') && DateTime.local().setZone(tz).isValid)
      .map((tz) => ({ id: tz, name: tz }))
  ),
].sort((a, b) => (a.name < b.name ? -1 : 1))

export type NewDeploymentFormValues = {
  deploymentName?: string
  gitTag?: string
  startTime?: string
  timeZone?: string
}

const schema = yup.object({
  deploymentName: yup.string().required('cannot be blank'),
  gitTag: yup.string().required('cannot be blank'),
  startTime: yup.string().required('cannot be blank'),
  timeZone: yup.string(),
})

export interface NewDeploymentFormProps
  extends FormProps<NewDeploymentFormValues> {
  tags?: SelectOption[]
  loading?: boolean
}

export const NewDeploymentForm: React.FC<NewDeploymentFormProps> = ({
  onSubmit: externalSubmitHandler,
  loading,
  tags,
  defaultValues = { startTime: '', timeZone: '' },
  hideSubmit,
  submitTitle,
  id,
}) => {
  const [isSelectMode, setIsSelectMode] = useState(false)

  const {
    handleSubmit,
    register,
    formState: { errors: formErrors },
    setError,
    reset,
    watch,
    control,
  } = useForm<NewDeploymentFormValues>({
    resolver: yupResolver(schema),
    mode: 'onBlur',
  })

  const [timeZone, startTime] = watch(['timeZone', 'startTime'])

  useDefaultValueListener<NewDeploymentFormValues>(defaultValues, reset)

  const handleFormSubmit = handleSubmit(async (data) => {
    const { errors = {} } = (await externalSubmitHandler(data)) ?? {}
    const keys = Object.keys(errors)
    if (keys.length) {
      keys.map((key) =>
        setError(camelCase(key) as keyof NewDeploymentFormValues, {
          message: errors[key],
        })
      )
    }
  })

  return (
    <form onSubmit={handleFormSubmit} className="relative" id={id}>
      <Fields register={register} errors={formErrors} grow className="pb-2">
        <TextField
          label="Deployment Name"
          className="w-full"
          name="deploymentName"
        />
        <Controller
          name="gitTag"
          control={control}
          render={({ field, formState: { errors } }) => (
            <SelectField
              placeholder="Select a git tag"
              options={tags}
              selfControllable
              {...field}
              onChange={undefined}
              onSelect={field.onChange}
              errorMessage={errors?.gitTag?.message}
            />
          )}
        />
        <Fields nested grow>
          <Controller
            name="startTime"
            control={control}
            render={({ field, formState: { errors } }) => {
              return (
                <DateField
                  label="Start time"
                  className="flex-shrink-0 flex-grow"
                  timeZone={timeZone}
                  {...field}
                  errorMessage={errors['startTime']?.message}
                />
              )
            }}
          />

          {isSelectMode ? (
            <Controller
              name="timeZone"
              control={control}
              render={({ field }) => (
                <SelectField
                  className="mt-auto flex-shrink-0 flex-grow"
                  placeholder="Local time"
                  options={luxonValidTimezones}
                  selfControllable
                  {...field}
                  onChange={undefined}
                  onSelect={(id: string | null) => {
                    setIsSelectMode(false)
                    field.onChange(id)
                  }}
                  value={
                    luxonValidTimezones.find((tz) => tz.name === timeZone)?.id
                  }
                />
              )}
            />
          ) : (
            <button
              className="mt-auto p-2"
              onClick={() => setIsSelectMode(true)}
            >
              {timeZone ? (
                <span className="underline">{timeZone}</span>
              ) : (
                <>
                  <span className="underline">Local time</span>/ UTC
                </>
              )}
            </button>
          )}
        </Fields>
        {timeZone && startTime ? (
          <span className="-mt-2 block stroke-stone-400 text-sm">
            {DateTime.fromISO(startTime).toString()}
          </span>
        ) : null}
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

NewDeploymentForm.displayName = 'Forms.NewDeploymentForm'
