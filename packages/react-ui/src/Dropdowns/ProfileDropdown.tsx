import React from 'react'
import { Avatar, Dropdown, DropdownProps } from '../Navigation'

export interface ProfileDropdownProps extends DropdownProps {
  profileName: string
  emailAddress: string
  profileRole?: string
  avatarUrl?: string
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  profileName,
  emailAddress,
  profileRole,
  avatarUrl,
  ...dropdownProps
}) => {
  return (
    <Dropdown
      {...dropdownProps}
      header={
        <ul className="flex">
          <li>
            <Avatar
              name={profileName}
              color={'lightGray'}
              imageUrl={avatarUrl}
            />
          </li>
          <li className="px-4">
            <div>{profileName}</div>
            <div className="font-sans text-sm font-light opacity-60">
              <span>{emailAddress}</span>
              {profileRole && <span className="ml-1">({profileRole})</span>}
            </div>
          </li>
        </ul>
      }
    />
  )
}

ProfileDropdown.displayName = 'Dropdowns.ProfileDropdown'
