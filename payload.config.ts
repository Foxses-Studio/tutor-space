import { buildConfig } from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

// Import Collections
import { Users } from './collections/Users'
import { Courses } from './collections/Courses'
import { Lessons } from './collections/Lessons'
import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Enrollments } from './collections/Enrollments'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '- Tutor Space Admin',
      icons: [
        {
          rel: 'icon',
          type: 'image/x-icon',
          url: '/favicon.ico',
        },
      ],
    },
  },
  editor: lexicalEditor(),
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URL || 'file:./payload.db',
    },
  }),
  sharp,
  collections: [
    Users,
    Courses,
    Lessons,
    Categories,
    Media,
    Enrollments,
  ],
  secret: process.env.PAYLOAD_SECRET || 'tutor-space-development-secret-key-1234567890',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
