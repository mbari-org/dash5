import { NextPage } from 'next'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'

const Vehicle: NextPage = () => {
  const router = useRouter()
  return (
    <Layout>
      <div className="flex h-full w-full flex-col">
        <h1 className="m-auto">{router.query.name}</h1>
      </div>
    </Layout>
  )
}

export default Vehicle
