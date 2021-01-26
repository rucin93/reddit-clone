import { Box, Button, Flex, Link } from '@chakra-ui/react'
import React from 'react'
import NextLink from 'next/link'
import { useLogoutMutation, useMeQuery } from '../generated/graphql'
import { isServer } from '../utils/isServer'

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  const [{ data, fetching }] = useMeQuery({
    pause: isServer(),
  })

  const [{ fetching: logoutFetching }, logout] = useLogoutMutation()
  let body = null
  if (fetching) {
    body = null
  } else if (!data?.me) {
    body = (
      <>
        <NextLink href="/login">
          <Link mr={2}>Login</Link>
        </NextLink>
        <NextLink href="/register">
          <Link>Register</Link>
        </NextLink>
      </>
    )
  } else {
    body = (
      <Flex>
        <Box mr={2}>user: {data.me.username}</Box>
        <Button
          variant="link"
          onClick={() => logout()}
          isLodaing={logoutFetching}
        >
          Logout
        </Button>
      </Flex>
    )
  }
  return (
    <Flex bg="tan" p={4}>
      <Box ml="auto" color="white">
        {body}
      </Box>
    </Flex>
  )
}
