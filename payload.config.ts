import { buildConfig } from 'payload'
import { resendAdapter } from '@payloadcms/email-resend'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

import { Users } from './collections/Users'
import { Courses } from './collections/Courses'
import { Lessons } from './collections/Lessons'
import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Enrollments } from './collections/Enrollments'
import { Blogs } from './collections/Blogs'
import { Students } from './collections/Students'
import { Reviews } from './collections/Reviews'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
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
  db: mongooseAdapter({
    url: process.env.DATABASE_URL || 'mongodb://127.0.0.1/tutor-space',
  }),
  sharp,
  collections: [
    Users,
    Courses,
    Lessons,
    Categories,
    Media,
    Enrollments,
    Blogs,
    Students,
    Reviews,
  ],
  secret: process.env.PAYLOAD_SECRET || 'tutor-space-development-secret-key-1234567890',
  email: resendAdapter({
    defaultFromAddress: process.env.RESEND_FROM_EMAIL || 'noreply@tutorspace.com',
    defaultFromName: 'Tutor Space Admin',
    apiKey: process.env.RESEND_API_KEY || '',
  }),
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
