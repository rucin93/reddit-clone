import { Box, Button } from '@chakra-ui/react'
import { Form, Formik } from 'formik'
import React from 'react'
import { useMutation } from 'urql'
import { InputField } from '../components/InputField'
import { Wrapper } from '../components/Wrapper'

interface registerProps {}

const REGISTER_MUTATION = `
mutation Register($username: String!, $password: String!) {
  register(options: { username: $username, password: $password }) {
    errors {
      message
      field
    }
    user {
      id
      username
    }
  }
}
`

const Register: React.FC<registerProps> = ({}) => {
  const [, register] = useMutation(REGISTER_MUTATION)
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{
          username: '',
          password: '',
        }}
        onSubmit={async (values) => {
          const response = await register(values)
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="username"
              placeholder="username"
              label="username"
            />
            <Box mt={4}>
              <InputField
                name="password"
                placeholder="password"
                label="password"
                type="password"
              />
            </Box>
            <Button
              mt={4}
              colorScheme="teal"
              isLoading={isSubmitting}
              type="submit"
            >
              register
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  )
}

export default Register
