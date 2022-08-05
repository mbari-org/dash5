import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { FormProps, useDefaultValueListener } from '@sumocreations/forms'
import { DateField, Fields, TextField } from '../Fields'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { camelCase } from 'lodash'
import clsx from 'clsx'
import { DateTime } from 'luxon'
import { AsyncSubmitHandler } from '@sumocreations/forms'

export type ScheduleCommandFormValues = {
  datetime: string
  scheduleId?: string
  notes?: string
}

export const schema = yup.object({
  datetime: yup.string().required('must schedule command'),
  scheduleId: yup.string(),
  notes: yup.string(),
})

export interface ScheduleCommandFormProps
  extends FormProps<ScheduleCommandFormValues> {
  vehicleName: string
  command: string
  onAltAddressSubmit?: AsyncSubmitHandler<ScheduleCommandFormValues>
}

const styles = {
  tealText: 'text-teal-500',
  grayText: 'text-black/80',
  buttonWrapper: 'flex items-center py-1',
  radioLabel: 'ml-2',
  radioButton: 'checked:accent-teal-500 w-5 h-5',
}

export const ScheduleCommandForm = React.forwardRef<
  HTMLButtonElement,
  ScheduleCommandFormProps
>(
  (
    {
      onSubmit: externalSubmitHandler,
      defaultValues,
      vehicleName,
      command,
      id,
    },
    ref
  ) => {
    const {
      handleSubmit,
      register,
      formState: { errors: formErrors },
      setError,
      reset,
    } = useForm<ScheduleCommandFormValues>({
      resolver: yupResolver(schema),
      mode: 'onBlur',
    })

    useDefaultValueListener<ScheduleCommandFormValues>(defaultValues, reset)

    const handleFormSubmit = (
      submitHandler: AsyncSubmitHandler<ScheduleCommandFormValues>
    ) =>
      handleSubmit(async (data) => {
        const { errors = {} } = (await submitHandler(data)) ?? {}
        const keys = Object.keys(errors)
        if (keys.length) {
          keys.map((key) =>
            setError(camelCase(key) as keyof ScheduleCommandFormValues, {
              message: errors[key],
            })
          )
        }
      })

    const [isEditTime, setIsEditTime] = useState(false)
    const [customTime, setCustomTime] = useState(DateTime.now().toISO())

    return (
      <form
        className="p-4"
        id={id}
        onSubmit={handleFormSubmit(externalSubmitHandler)}
      >
        <div className="pb-2 text-lg">
          Schedule <span className={styles.tealText}>{command}</span> command
          for <span className={styles.tealText}>{vehicleName}</span>
        </div>
        <Fields register={register} errors={formErrors}>
          <ul className={styles.grayText}>
            <li className={styles.buttonWrapper}>
              <input
                {...register('datetime')}
                className={styles.radioButton}
                type="radio"
                value="asap"
                id="asap"
                name="datetime"
                onChange={() => isEditTime && setIsEditTime(false)}
                required
              />
              <label className={styles.radioLabel} htmlFor="asap">
                ASAP
              </label>
            </li>
            <li className={styles.buttonWrapper}>
              <input
                {...register('datetime')}
                className={styles.radioButton}
                type="radio"
                value="endOfSchedule"
                id="endofschedule"
                name="datetime"
                onChange={() => isEditTime && setIsEditTime(false)}
                required
              />
              <label className={styles.radioLabel} htmlFor="endofschedule">
                At the end of the current schedule
              </label>
            </li>
            <li className={styles.buttonWrapper}>
              <input
                {...register('datetime')}
                className={styles.radioButton}
                type="radio"
                value={customTime}
                id="custom"
                name="datetime"
                onChange={() => setIsEditTime(true)}
                required
              />
              <label className={styles.radioLabel} htmlFor="custom">
                For specific time{isEditTime && ':'}
              </label>
              {isEditTime && (
                <DateField
                  value={customTime}
                  name="customTime"
                  onChange={(time) => setCustomTime(time)}
                  className="ml-2"
                />
              )}
            </li>
          </ul>
          <div className="flex items-center pb-6">
            <label
              htmlFor="scheduleId"
              className={clsx('mr-2', styles.grayText)}
            >
              Custom schedule id (optional):
            </label>
            <TextField
              {...register('scheduleId')}
              name="scheduleId"
              className="flex"
            />
          </div>
          <label htmlFor="notes">Notes (will appear in log)</label>
          <TextField name="notes" className="mt-1 w-2/3" />
        </Fields>
        <button className="hidden" type="submit" ref={ref} />
      </form>
    )
  }
)

ScheduleCommandForm.displayName = 'Forms/ScheduleCommandForm'
