import type { CollectionConfig } from 'payload'

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  labels: {
    singular: 'Review & Rating',
    plural: 'Reviews & Ratings',
  },
  admin: {
    useAsTitle: 'rating',
    group: 'LMS',
    defaultColumns: ['course', 'student', 'rating', 'status'],
  },
  fields: [
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'courses',
      required: true,
    },
    {
      name: 'student',
      type: 'relationship',
      relationTo: 'students',
      required: true,
    },
    {
      name: 'rating',
      type: 'select',
      required: true,
      defaultValue: '5',
      options: [
        { label: '⭐️ (1 Star)', value: '1' },
        { label: '⭐️⭐️ (2 Stars)', value: '2' },
        { label: '⭐️⭐️⭐️ (3 Stars)', value: '3' },
        { label: '⭐️⭐️⭐️⭐️ (4 Stars)', value: '4' },
        { label: '⭐️⭐️⭐️⭐️⭐️ (5 Stars)', value: '5' },
      ],
    },
    {
      name: 'comment',
      type: 'textarea',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      required: true,
      options: [
        { label: 'Pending Approval', value: 'pending' },
        { label: 'Approved & Live', value: 'approved' },
        { label: 'Spam/Rejected', value: 'rejected' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
