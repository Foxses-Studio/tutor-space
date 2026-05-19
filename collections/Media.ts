import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Content',
  },
  upload: {
    staticDir: 'public/media',
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: 512,
        position: 'centre',
      },
      {
        name: 'hero',
        width: 1920,
        height: 1080,
        position: 'centre',
      },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*'],
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeValidate: [
      ({ data, req }) => {
        if (data && !data.alt) {
          let rawName = data.filename || ''
          if (!rawName && req && (req as any).file) {
            rawName = (req as any).file.name || ''
          }
          const nameToUse = rawName || 'Uploaded Media'
          const dotIdx = nameToUse.lastIndexOf('.')
          const cleanName = dotIdx !== -1 ? nameToUse.substring(0, dotIdx) : nameToUse
          
          data.alt = cleanName
            .replace(/[-_]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .replace(/\b\w/g, (c: string) => c.toUpperCase()) || 'Uploaded Media'
        }
        return data
      }
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
}
