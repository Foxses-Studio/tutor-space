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
      name: 'videoFile',
      type: 'upload',
      relationTo: 'videos',
      required: false,
      admin: {
        description: 'Or upload a video file directly to the server.',
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
    {
      name: 'duration',
      type: 'number',
      required: false,
      admin: {
        description: 'Duration of the lesson in minutes.',
        position: 'sidebar',
      },
    },
    {
      name: 'isPreviewable',
      type: 'checkbox',
      label: 'Free Preview',
      defaultValue: false,
      admin: {
        description: 'Allow non-enrolled students to watch this lesson as a demo.',
        position: 'sidebar',
      },
    },
    {
      name: 'seo',
      type: 'group',
      label: 'SEO Settings',
      admin: {
        position: 'sidebar',
      },
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          label: 'Meta Title',
          admin: {
            description: 'Recommended: 50-60 characters.',
          },
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          label: 'Meta Description',
          admin: {
            description: 'Recommended: 150-160 characters.',
          },
        },
        {
          name: 'keywords',
          type: 'text',
          label: 'Focus Keywords',
          admin: {
            description: 'Comma-separated values.',
          },
        },
      ],
    },
  ],
}
