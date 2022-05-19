import { NextPage } from 'next'
import Head from 'next/head'
import { AsyncSubmitHandler } from '@sumocreations/forms'
import { PrimaryToolbar, LoginModal, LoginFormValues } from '@mbari/react-ui'
import { useEffect } from 'react'
import toast from 'react-hot-toast'
import useAuthenticatedRedirect from '../lib/useAuthenticatedRedirect'
import { useAuthContext } from '@mbari/api-client'

const Home: NextPage = () => {
  useAuthenticatedRedirect({
    redirectTo: '/dashboard',
    redirectIfAuthenticated: true,
  })

  const { login, loading, authenticated, error } = useAuthContext()

  const handleForgotPass = () => {
    console.log('Forgot password')
  }
  const handleSubmit: AsyncSubmitHandler<LoginFormValues> = async (values) => {
    await login(values.email, values.password)
    return undefined
  }

  useEffect(() => {
    if (!loading && error) {
      toast.error(error)
    }
  }, [loading, error])

  const handleCreateAccount = () => undefined

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
      <PrimaryToolbar />
      {!authenticated && (
        <div className="fixed top-0 left-0 h-screen w-screen bg-sky-100/10">
          <LoginModal
            onSubmit={handleSubmit}
            onForgotPass={handleForgotPass}
            onCreateAcct={handleCreateAccount}
            loading={loading}
            open
          />
        </div>
      )}
    </div>
  )
}

export default Home
