import React, { useEffect } from 'react'
import Head from 'next/head'
import { PrimaryToolbar, ProfileDropdown } from '@mbari/react-ui'
import { useAuthContext } from '@mbari/api-client'
import { useState } from 'react'
import Image from 'next/image'
import VehicleDeploymentDropdown from '../components/VehicleDeploymentDropdown'
import useTrackedVehicles from '../lib/useTrackedVehicles'
import { useRouter } from 'next/router'
import { UserLogin } from './UserLogin'
import logo from './mbari-logo.png'

const Layout: React.FC = ({ children }) => {
  const [showLogin, setLogin] = useState(false)
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    if (!mounted) setMounted(true)
  }, [setMounted, mounted])

  const { trackedVehicles, setTrackedVehicles } = useTrackedVehicles()

  const { logout, profile, authenticated } = useAuthContext()
  const profileName = `${profile?.firstName} ${profile?.lastName}`
  const handleLogout = () => {
    dismissDropdown()
    logout()
  }

  const [dropdown, setDropdown] = useState(null as null | 'profile' | 'vehicle')
  const handleDropdown = (dropdown: 'profile' | 'vehicle') => () => {
    setDropdown(dropdown)
  }

  const dismissDropdown = () => {
    setDropdown(null)
  }

  const toggleLogin = (enabled: boolean) => () => {
    setLogin(enabled)
  }

  useEffect(() => {
    if (authenticated && showLogin) {
      setLogin(false)
    }
  }, [authenticated, setLogin, showLogin])

  const handleSelectOption = (option: string) => {
    if (option === 'Overview') {
      router.push('/')
    } else {
      router.push(`/vehicle/${option}`)
    }
  }

  const handleRemoveOption = (vehicle: string) => {
    setTrackedVehicles(trackedVehicles.filter((v) => v !== vehicle))
    if ((router.query.name as string) === vehicle) {
      router.push('/')
    }
  }

  const canRemoveOption = (vehicle: string) => vehicle !== 'Overview'

  return (
    <div className="flex h-screen w-screen flex-col">
      <Head>
        <title>LRAUV Dash Client</title>
        <meta
          name="description"
          content="Manage and plan missions for various LRAUV"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {mounted && (
        <PrimaryToolbar
          options={['Overview', ...trackedVehicles]}
          currentOption={(router.query.name as string) ?? 'Overview'}
          onSelectOption={handleSelectOption}
          onRemoveOption={handleRemoveOption}
          canRemoveOption={canRemoveOption}
          avatarName={profileName}
          onAvatarClick={handleDropdown('profile')}
          onAddClick={handleDropdown('vehicle')}
          addItemDropdown={
            dropdown === 'vehicle' ? (
              <VehicleDeploymentDropdown
                onDismiss={dismissDropdown}
                className="absolute left-0 z-[1001] mt-2 max-h-96 w-96"
                style={{ top: '100%' }}
                scrollable
              />
            ) : null
          }
          logo={<Image src={logo} width={42} height={32} alt="MBARI" />}
          secondaryDropdown={
            dropdown === 'profile' && authenticated ? (
              <>
                <ProfileDropdown
                  className="top-100 absolute right-0 z-[500] mt-2"
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
          onLoginClick={toggleLogin(true)}
          signedIn={authenticated}
        />
      )}
      {children}
      {showLogin && !authenticated && (
        <UserLogin onClose={toggleLogin(false)} />
      )}
    </div>
  )
}

export default Layout
