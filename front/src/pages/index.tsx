import React from 'react'
import { NavBar } from '../components/NavBar'
import { withUrqlClient } from 'next-urql'
import { createUrqlClient } from '../utils/createUrqlClient'
import { usePostsQuery } from '../generated/graphql'

const Index = () => {
  const [{ data }] = usePostsQuery()
  return (
    <>
      <NavBar />
      <div>hello</div>
      <hr />
      {data ? (
        data.posts.map((p) => <div key={p.id}>{p.title}</div>)
      ) : (
        <div>Loading...</div>
      )}
    </>
  )
}

export default withUrqlClient(createUrqlClient, { ssr: true })(Index)
