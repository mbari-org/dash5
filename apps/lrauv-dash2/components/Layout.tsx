import React, { useEffect } from 'react'
import Head from 'next/head'
import { PrimaryToolbar, ProfileDropdown } from '@mbari/react-ui'
import { useTethysApiContext } from '@mbari/api-client'
import { useState } from 'react'
import Image from 'next/image'
import VehicleDeploymentDropdown from '../components/VehicleDeploymentDropdown'
import useTrackedVehicles from '../lib/useTrackedVehicles'
import useGlobalModalId, { GlobalModalState } from '../lib/useGlobalModalId'
import { useRouter } from 'next/router'
import { UserLogin } from './UserLogin'
import logo from './mbari-logo.png'
import UserCreateAccount from './UserCreateAccount'
import UserForgotPassword from './UserForgotPassword'
import { NewDeployment } from './NewDeployment'
import DeploymentDetails from './DeploymentDetails'
import Reassignment from './Reassignment'
import SendNote from './SendNote'
import DocumentInstanceModal from './DocumentInstanceModal'
import AttachmentModal from './AttachmentModal'
import DetachModal from './DetachModal'
import MissionModal from './MissionModal'
import { CommandModal } from './CommandModal'

const Layout: React.FC = ({ children }) => {
  const [showLogin, setLogin] = useState(false)
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const { globalModalId, setGlobalModalId } = useGlobalModalId()
  useEffect(() => {
    if (!mounted) setMounted(true)
  }, [setMounted, mounted])

  const { trackedVehicles, setTrackedVehicles } = useTrackedVehicles()

  const { logout, profile, authenticated } = useTethysApiContext()
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

  const setModal = (newState: GlobalModalState | null) => () => {
    setGlobalModalId(newState)
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

  const requireAuthentication = (modalJsx: React.ReactNode) =>
    authenticated ? modalJsx : <UserLogin onClose={setModal(null)} />

  return (
    <div className="flex h-screen w-screen flex-col">
      <Head>
        <title>LRAUV Dash Client</title>
        <meta
          name="description"
          content="Manage and plan missions for various LRAUV"
        />
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
          onLoginClick={setModal({ id: 'login' })}
          signedIn={authenticated}
        />
      )}
      {children}
      {globalModalId?.id === 'login' && !authenticated && (
        <UserLogin onClose={setModal(null)} />
      )}
      {globalModalId?.id === 'signup' && !authenticated && (
        <UserCreateAccount onClose={setModal(null)} />
      )}
      {globalModalId?.id === 'forgot' && !authenticated && (
        <UserForgotPassword onClose={setModal(null)} />
      )}
      {globalModalId?.id === 'newDeployment' &&
        requireAuthentication(<NewDeployment onClose={setModal(null)} />)}
      {globalModalId?.id === 'editDocument' && (
        <DocumentInstanceModal onClose={setModal(null)} />
      )}
      {globalModalId?.id === 'reassign' &&
        requireAuthentication(<Reassignment vehicleNames={trackedVehicles} />)}
      {globalModalId?.id === 'sendNote' &&
        requireAuthentication(<SendNote onClose={setModal(null)} />)}
      {globalModalId?.id === 'editDeployment' &&
        requireAuthentication(<DeploymentDetails onClose={setModal(null)} />)}
      {globalModalId?.id === 'attachDocument' &&
        requireAuthentication(<AttachmentModal onClose={setModal(null)} />)}
      {globalModalId?.id === 'detachDocument' &&
        requireAuthentication(<DetachModal onClose={setModal(null)} />)}
      {globalModalId?.id === 'newMission' &&
        requireAuthentication(<MissionModal onClose={setModal(null)} />)}
      {globalModalId?.id === 'newCommand' &&
        requireAuthentication(<CommandModal onClose={setModal(null)} />)}
    </div>
  )
}

export default Layout
