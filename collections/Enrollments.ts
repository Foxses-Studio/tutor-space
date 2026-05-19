import type { CollectionConfig } from 'payload'

export const Enrollments: CollectionConfig = {
  slug: 'enrollments',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['student', 'course', 'paymentStatus', 'createdAt'],
    group: 'LMS',
  },
  access: {
    // Only logged in users can see their own enrollments, admins see everything
    read: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      return {
        student: {
          equals: user.id,
        },
      }
    },
    create: ({ req: { user } }) => {
      if (!user) return false;
      return user.role === 'admin'; // Usually handled via payment gateway webhooks or admin action
    },
    update: ({ req: { user } }) => {
      if (!user) return false;
      return user.role === 'admin';
    },
    delete: ({ req: { user } }) => {
      if (!user) return false;
      return user.role === 'admin';
    },
  },
  fields: [
    {
      name: 'student',
      type: 'relationship',
      relationTo: 'students',
      required: true,
      admin: {
        description: 'The student who is enrolled in the course.',
      },
    },
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'courses',
      required: true,
      admin: {
        description: 'The course the student is enrolled in.',
      },
    },
    {
      name: 'paymentStatus',
      type: 'select',
      defaultValue: 'pending',
      required: true,
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Completed', value: 'completed' },
        { label: 'Refunded', value: 'refunded' },
      ],
    },
    {
      name: 'pricePaid',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        description: 'The actual price paid by the student.',
      },
    },
    {
      name: 'paymentReference',
      type: 'text',
      required: false,
      admin: {
        description: 'Transaction ID or Reference ID from the payment gateway.',
      },
    },
  ],
  timestamps: true,
}
