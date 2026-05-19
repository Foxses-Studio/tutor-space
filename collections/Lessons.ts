import type { CollectionConfig } from 'payload'

export const Lessons: CollectionConfig = {
  slug: 'lessons',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'course', 'order'],
    group: 'LMS',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'courses',
      required: true,
      admin: {
        description: 'The course that this lesson belongs to.',
      },
    },
    {
      name: 'order',
      type: 'number',
      required: true,
      min: 1,
      admin: {
        description: 'The order number of this lesson (e.g. 1, 2, 3...)',
      },
    },
    {
      name: 'videoUrl',
      type: 'text',
      required: false,
      admin: {
        description: 'Link to the hosted lesson video (YouTube, Vimeo, Cloudinary, etc.)',
      },
    },
    {
      name: 'content',
      type: 'richText', // Lexical rich text
      required: false,
      admin: {
        description: 'Lesson content, resources, or text instructions.',
      },
    },
  ],
}
