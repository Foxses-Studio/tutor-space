import type { CollectionConfig } from 'payload'

export const Videos: CollectionConfig = {
  slug: 'videos',
  labels: {
    singular: 'Video',
    plural: 'Videos',
  },
  admin: {
    group: 'Content',
  },
  upload: {
    staticDir: 'public/videos',
    mimeTypes: ['video/*'], // Restrict strictly to video files
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
  ],
}
