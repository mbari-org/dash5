import React from 'react'
import { Dropdown, DropdownProps } from '../Navigation'

const styles = {
  header: 'text-stone-600 opacity-60',
}

export const VehicleDropdown: React.FC<DropdownProps> = ({
  ...dropdownProps
}) => {
  return (
    <Dropdown
      {...dropdownProps}
      header={<span className={styles.header}>Select LRAUV</span>}
    />
  )
}

VehicleDropdown.displayName = 'Dropdowns.VehicleDropdown'
