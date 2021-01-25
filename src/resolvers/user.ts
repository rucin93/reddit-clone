import { User } from '../entities/User'
import { MyContext } from 'src/types'
import {
  Resolver,
  Mutation,
  Arg,
  InputType,
  Field,
  Ctx,
  ObjectType,
} from 'type-graphql'
import argon2 from 'argon2'

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string
  @Field()
  password: string
}

@ObjectType()
class FieldError {
  @Field()
  field: string

  @Field()
  message: string
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], {
    nullable: true,
  })
  errors?: FieldError[]

  @Field(() => User, {
    nullable: true,
  })
  user?: User
}

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse> {
    if (options.username.length < 3) {
      return {
        errors: [
          {
            field: 'username',
            message: 'Username must be longer than 2',
          },
        ],
      }
    }

    if (options.username.length > 250) {
      return {
        errors: [
          {
            field: 'username',
            message: 'Username must be shorter than 250',
          },
        ],
      }
    }

    if (options.password.length < 6) {
      return {
        errors: [
          {
            field: 'password',
            message: 'Password must be greater than 5',
          },
        ],
      }
    }

    const hash = await argon2.hash(options.password)
    const user = em.create(User, { username: options.username, password: hash })

    try {
      await em.persistAndFlush(user)
    } catch (err) {
      // duplicate username
      if (err.code === '23505') {
        return {
          errors: [
            {
              field: 'username',
              message: 'Username already exists',
            },
          ],
        }
      }
      console.error(err.message)
    }
    return {
      user,
    }
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, { username: options.username })
    if (!user) {
      return {
        errors: [
          {
            field: 'username',
            message: "Username doesn't exist",
          },
        ],
      }
    }
    const valid = await argon2.verify(user.password, options.password)
    if (!valid) {
      return {
        errors: [
          {
            field: 'password',
            message: 'incorrect password',
          },
        ],
      }
    }

    req.session!.userId = user.id

    return {
      user,
    }
  }
}
