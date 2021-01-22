import { __prod__ } from './const'
import { Post } from './entities/Post'
import { MikroORM } from '@mikro-orm/core'
import path from 'path'

export default {
  dbName: 'lireddit',
  type: 'postgresql',
  migrations: {
    path: path.join(__dirname, './migrations'),
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
  debug: !__prod__,
  entities: [Post],
} as Parameters<typeof MikroORM.init>[0]
