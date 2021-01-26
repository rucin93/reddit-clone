import { User } from '../entities/User'
import { MyContext } from 'src/types'
import {
  Resolver,
  Mutation,
  Arg,
  Field,
  Ctx,
  ObjectType,
  Query,
} from 'type-graphql'
import argon2 from 'argon2'
import { EntityManager } from '@mikro-orm/postgresql'
import { COOKIE_NAME } from '../const'
import { UsernamePasswordInput } from './UsernamePasswordInput'

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
  @Query(() => User, { nullable: true })
  async me(@Ctx() { em, req }: MyContext) {
    if (!req.session.userId) {
      return null
    }

    const user = await em.findOne(User, { id: req.session.userId })
    return user
  }

  // @Mutation(() => Boolean)
  // async forgotPassword(@Arg('email') email: string, @Ctx() { em }: MyContext) {
  //   // const user = await em.findOne(User, {email})
  //   return true
  // }

  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
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

    if (!options.email.includes('@')) {
      return {
        errors: [
          {
            field: 'email',
            message: 'invalid email',
          },
        ],
      }
    }

    const hash = await argon2.hash(options.password)
    let user
    try {
      const result = await (em as EntityManager)
        .createQueryBuilder(User)
        .getKnexQuery()
        .insert({
          username: options.username,
          email: options.email,
          password: hash,
          create_at: new Date(),
          updated_at: new Date(),
        })
        .returning('*')
      user = result[0]
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

    req.session!.userId = user.id

    return {
      user,
    }
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('username') username: string,
    @Arg('password') password: string,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, { username: username })
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
    const valid = await argon2.verify(user.password, password)
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

    // make user logged in after register
    req.session!.userId = user.id

    return {
      user,
    }
  }
  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        if (err) {
          console.log(err)

          resolve(false)
          return
        }

        res.clearCookie(COOKIE_NAME)
        resolve(true)
      })
    )
  }
}
