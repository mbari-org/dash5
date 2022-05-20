import { NextPage } from 'next'
import Head from 'next/head'
import { PrimaryToolbar, ProfileDropdown } from '@mbari/react-ui'
import useAuthenticatedRedirect from '../lib/useAuthenticatedRedirect'
import { useAuthContext } from '@mbari/api-client'
import { useState } from 'react'
import VehicleDeploymentDropdown from '../components/VehicleDeploymentDropdown'

const Dashboard: NextPage = () => {
  useAuthenticatedRedirect({
    redirectTo: '/',
  })

  const { logout, profile } = useAuthContext()
  const profileName = `${profile?.firstName} ${profile?.lastName}`
  const handleLogout = () => {
    logout()
  }

  const [dropdown, setDropdown] = useState(null as null | 'profile' | 'vehicle')
  const handleDropdown = (dropdown: 'profile' | 'vehicle') => () => {
    setDropdown(dropdown)
  }

  const dismissDropdown = () => {
    setDropdown(null)
  }

  return (
    <div className="flex flex-col">
      <Head>
        <title>LRAUV Dash Client</title>
        <meta
          name="description"
          content="Manage and plan missions for various LRAUV"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PrimaryToolbar
        options={['Overview']}
        currentOption="Overview"
        avatarName={profileName}
        onAvatarClick={handleDropdown('profile')}
        onAddClick={handleDropdown('vehicle')}
        addItemDropdown={
          dropdown === 'vehicle' ? (
            <VehicleDeploymentDropdown
              onDismiss={dismissDropdown}
              className="absolute left-0 z-20 mt-2 max-h-96 w-96"
              style={{ top: '100%' }}
              scrollable
            />
          ) : null
        }
        secondaryDropdown={
          dropdown === 'profile' ? (
            <>
              <ProfileDropdown
                className="top-100 absolute right-0 z-20 mt-2"
                profileName={profileName}
                emailAddress={profile?.email ?? ''}
                profileRole={profile?.roles?.[0]}
                onDismiss={dismissDropdown}
                options={[
                  {
                    label: 'Logout',
                    onSelect: handleLogout,
                  },
                ]}
              />
            </>
          ) : null
        }
        signedIn
      />
    </div>
  )
}

export default Dashboard
