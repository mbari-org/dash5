import React, { useEffect } from 'react'
import Head from 'next/head'
import {
  PrimaryToolbar,
  ProfileDropdown,
  ReassignmentModal,
} from '@mbari/react-ui'
import { useAuthContext } from '@mbari/api-client'
import { useState } from 'react'
import Image from 'next/image'
import VehicleDeploymentDropdown from '../components/VehicleDeploymentDropdown'
import useTrackedVehicles from '../lib/useTrackedVehicles'
import useGlobalModalId, { ModalId } from '../lib/useGlobalModalId'
import { useRouter } from 'next/router'
import { UserLogin } from './UserLogin'
import logo from './mbari-logo.png'
import { capitalize } from '@mbari/utils'
import UserCreateAccount from './UserCreateAccount'
import UserForgotPassword from './UserForgotPassword'

const Layout: React.FC = ({ children }) => {
  const [showLogin, setLogin] = useState(false)
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const { globalModalId, setGlobalModalId } = useGlobalModalId()
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

  const setModal = (id: ModalId) => () => {
    setGlobalModalId(id)
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

  const handleReassignmentSubmit = async () => undefined

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
          currentOption={(router.query.deployment?.[0] as string) ?? 'Overview'}
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
          onLoginClick={setModal('login')}
          signedIn={authenticated}
        />
      )}
      {children}
      {globalModalId === 'login' && !authenticated && (
        <UserLogin onClose={setModal(null)} />
      )}
      {globalModalId === 'signup' && !authenticated && (
        <UserCreateAccount onClose={setModal(null)} />
      )}
      {globalModalId === 'forgot' && !authenticated && (
        <UserForgotPassword onClose={setModal(null)} />
      )}
      {globalModalId === 'reassign' && !authenticated && (
        <ReassignmentModal
          onClose={setModal(null)}
          vehicles={trackedVehicles.map((v) => ({
            vehicleName: capitalize(v),
            vehicleId: v,
            pic: 'Shannon Johnson',
            onCall: 'Brian Kieft',
          }))}
          onSubmit={handleReassignmentSubmit}
          pics={[
            { name: 'Carlos Rueda', id: '1' },
            { name: 'Karen Salemy', id: '2' },
            { name: 'Brian Kieft', id: '3' },
          ]}
          onCalls={[
            { name: 'Carlos Rueda', id: '1' },
            { name: 'Karen Salemy', id: '2' },
            { name: 'Shannon Johnson', id: '3' },
          ]}
          open
        />
      )}
    </div>
  )
}

export default Layout
