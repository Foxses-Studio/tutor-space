import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    // Enable authentication
    tokenExpiration: 7200, // 2 hours
    verify: false, // Set to true if email verification is needed
  },
  admin: {
    useAsTitle: 'email',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'phone',
      type: 'text',
      required: false,
    },
    {
      name: 'profilePic',
      type: 'relationship',
      relationTo: 'media',
      required: false,
    },
    {
      name: 'role',
      type: 'select',
      defaultValue: 'student',
      required: true,
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Staff', value: 'staff' },
        { label: 'Instructor', value: 'instructor' },
        { label: 'Student', value: 'student' },
      ],
    },
  ],
}
