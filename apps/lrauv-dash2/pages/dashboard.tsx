import { NextPage } from 'next'
import Head from 'next/head'
import { PrimaryToolbar, ProfileDropdown } from '@mbari/react-ui'
import useAuthenticatedRedirect from '../lib/useAuthenticatedRedirect'
import { useAuthContext } from '@mbari/api-client'
import { useState } from 'react'
import { swallow } from '@mbari/utils'

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
  const dismissDropdown = swallow(() => {
    setDropdown(null)
  })
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
        secondaryDropdown={
          dropdown === 'profile' ? (
            <>
              <ProfileDropdown
                className="top-100 absolute right-0 z-20 mt-2"
                profileName={profileName}
                emailAddress={profile?.email ?? ''}
                profileRole={profile?.roles?.[0]}
                options={[
                  {
                    label: 'Logout',
                    onSelect: handleLogout,
                  },
                ]}
              />
              <button
                className="fixed top-0 left-0 z-10 h-screen w-screen bg-stone-100 opacity-5 active:bg-stone-200"
                onClick={dismissDropdown}
              ></button>
            </>
          ) : null
        }
        signedIn
      />
    </div>
  )
}

export default Dashboard
