import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
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

// Assumes we have some existing UI implementation for forms in our library. Replace as needed.
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
  localTime?: string
}

const schema = yup.object({
  deploymentName: yup.string().required('cannot be blank'),
  gitTag: yup.string().required('cannot be blank'),
  startTime: yup.string().required('cannot be blank'),
  localTime: yup.string().required('cannot be blank'),
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
  defaultValues,
  hideSubmit,
  submitTitle,
  id,
}) => {
  const [isSelectMode, setIsSelectMode] = useState(false)

  const {
    handleSubmit,
    register,
    control,
    formState: { errors: formErrors },
    setError,
    reset,
    watch,
  } = useForm<NewDeploymentFormValues>({
    resolver: yupResolver(schema),
    mode: 'onBlur',
  })

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
          {...register('deploymentName')}
        />
        <Controller
          control={control}
          name="gitTag"
          render={({ field }) => (
            <SelectField
              placeholder="Select a git tag"
              options={tags}
              {...field}
            />
          )}
        />
        <div className="flex flex-row items-end">
          <div className="w-7/12">
            <Controller
              control={control}
              name="startTime"
              render={({ field }) => (
                <DateField label="Start time" className="w-full" {...field} />
              )}
            />
          </div>
          <div className="ml-2 w-5/12">
            {isSelectMode ? (
              <Controller
                control={control}
                name="localTime"
                render={({ field: { value, onChange, name, ref } }) => (
                  <SelectField
                    ref={ref}
                    placeholder="Local time"
                    name={name}
                    value={
                      luxonValidTimezones.find((tz) => tz.name === value)?.id
                    }
                    options={luxonValidTimezones}
                    onChange={(value) => {
                      setIsSelectMode(false)
                      console.log(value)
                      onChange(value)
                    }}
                  />
                )}
              />
            ) : (
              <div
                className="p-2"
                role="button"
                onClick={() => setIsSelectMode(true)}
              >
                <span className="underline">Local time</span>/ UTC
              </div>
            )}
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

NewDeploymentForm.displayName = 'Forms.NewDeploymentForm'
