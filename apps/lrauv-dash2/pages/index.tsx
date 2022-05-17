import { useState } from 'react'
import { NextPage } from 'next'
import Head from 'next/head'
import { AsyncSubmitHandler } from '@sumocreations/forms'
import { PrimaryToolbar, LoginModal, LoginFormValues } from '@mbari/react-ui'
import { useAuthContext } from '@mbari/api-client'

const Home: NextPage = () => {
  const auth = useAuthContext()
  const [login, setLogin] = useState(false)
  const handleLoginClick = () => {
    setLogin(true)
  }
  const handleForgotPass = () => {
    console.log('Forgot password')
  }
  const handleSubmit: AsyncSubmitHandler<LoginFormValues> = async (values) => {
    console.log(values)
    await auth.login(values.email, values.password)
    return undefined
  }

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
      <PrimaryToolbar onLoginClick={handleLoginClick} />
      {login && (
        <LoginModal
          onSubmit={handleSubmit}
          onForgotPass={handleForgotPass}
          onCreateAcct={handleCreateAccount}
          open
        />
      )}
    </div>
  )
}

export default Home
