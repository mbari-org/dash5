import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'
import {
  LogFiltersDropdown,
  LogFiltersDropdownProps,
} from './LogFiltersDropdown'
import { Button } from '../Navigation/Button'

export default {
  title: 'Navigation/LogFiltersDropdown',
  component: LogFiltersDropdown,
} as Meta

const ALL_VALUES = [
  'argoReceive',
  'command',
  'dataProcessed',
  'deploy',
  'emergency',
  'gpsFix',
  'launch',
  'logCritical',
  'logFault',
  'logImportant',
  'logPath',
  'note',
  'patch',
  'recover',
  'run',
  'sbdReceipt',
  'sbdReceive',
  'sbdSend',
  'tracking',
] as const

const toOptions = (ids: readonly string[]) =>
  ids.map((id) => ({ id, label: id }))

const Template: Story<LogFiltersDropdownProps> = (args) => {
  const [visible, setVisible] = React.useState(true)
  const allOptions = React.useMemo(() => toOptions(ALL_VALUES), [])
  const [search, setSearch] = React.useState('')
  const [selected, setSelected] = React.useState<string[]>(
    allOptions.map((o) => o.id)
  )

  return (
    <div className="bg-stone-200 p-4">
      <div className="flex items-center gap-3">
        <Button onClick={() => setVisible(!visible)}>Toggle Filters</Button>
      </div>

      {visible && (
        <LogFiltersDropdown
          {...args}
          options={allOptions}
          selectedIds={selected}
          onChange={setSelected}
          searchValue={search}
          onSearchChange={setSearch}
        />
      )}
    </div>
  )
}

export const Standard = Template.bind({})
Standard.args = {
  className: '',
}
