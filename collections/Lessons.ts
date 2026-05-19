import type { CollectionConfig, CollectionBeforeChangeHook } from 'payload'

const generateZoomMeeting = async (title: string, startTime: string, duration?: number) => {
  const accountId = process.env.ZOOM_ACCOUNT_ID
  const clientId = process.env.ZOOM_CLIENT_ID
  const clientSecret = process.env.ZOOM_CLIENT_SECRET

  if (!accountId || !clientId || !clientSecret) {
    throw new Error('Zoom credentials are missing in .env.local. Please add ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, and ZOOM_CLIENT_SECRET.')
  }

  // 1. Fetch Server-to-Server OAuth Token
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  const tokenResponse = await fetch(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  )

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text()
    throw new Error(`Zoom Auth Error: ${errorText}`)
  }

  const tokenData = (await tokenResponse.json()) as { access_token: string }
  const accessToken = tokenData.access_token

  // 2. Create Zoom Meeting
  const meetingResponse = await fetch('https://api.zoom.us/v2/users/me/meetings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      topic: title,
      type: 2, // Scheduled meeting
      start_time: new Date(startTime).toISOString(),
      duration: duration || 60,
      timezone: 'Asia/Dhaka', // Default Bangladesh Timezone
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: false,
        mute_upon_entry: true,
        waiting_room: true,
      },
    }),
  })

  if (!meetingResponse.ok) {
    const errorText = await meetingResponse.text()
    throw new Error(`Zoom Meeting Creation Error: ${errorText}`)
  }

  const meetingData = (await meetingResponse.json()) as { join_url: string }
  return meetingData.join_url
}

const beforeChangeHook: CollectionBeforeChangeHook = async ({ data }) => {
  if (
    data.lessonType === 'live' &&
    data.livePlatform === 'zoom' &&
    data.autoGenerateZoom &&
    data.liveDate
  ) {
    try {
      const joinUrl = await generateZoomMeeting(data.title, data.liveDate, data.duration)
      data.liveUrl = joinUrl
      data.autoGenerateZoom = false // Reset checkbox after successful creation
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'An unknown error occurred while creating Zoom meeting.')
    }
  }
  return data
}

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
  hooks: {
    beforeChange: [beforeChangeHook],
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
      name: 'lessonType',
      type: 'select',
      defaultValue: 'recorded',
      required: true,
      options: [
        { label: 'Recorded Video', value: 'recorded' },
        { label: 'Live Class (Zoom / Meet)', value: 'live' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'videoUrl',
      type: 'text',
      required: false,
      admin: {
        description: 'Link to the hosted lesson video (YouTube, Vimeo, Cloudinary, etc.)',
        condition: (data) => !data || data.lessonType === 'recorded',
      },
    },
    {
      name: 'videoFile',
      type: 'upload',
      relationTo: 'videos',
      required: false,
      admin: {
        description: 'Or upload a video file directly to the server.',
        condition: (data) => !data || data.lessonType === 'recorded',
      },
    },
    {
      name: 'livePlatform',
      type: 'select',
      defaultValue: 'zoom',
      options: [
        { label: 'Zoom', value: 'zoom' },
        { label: 'Google Meet', value: 'meet' },
        { label: 'Microsoft Teams', value: 'teams' },
        { label: 'Other / Custom Platform', value: 'other' },
      ],
      admin: {
        condition: (data) => data?.lessonType === 'live',
        position: 'sidebar',
      },
      validate: (value: any, { data }: any) => {
        if (data?.lessonType === 'live' && !value) {
          return 'Live Platform is required for live classes.'
        }
        return true
      },
    },
    {
      name: 'autoGenerateZoom',
      type: 'checkbox',
      label: 'Auto-generate Zoom Meeting Link',
      defaultValue: false,
      admin: {
        description: 'Check this box to automatically create a Zoom meeting upon saving (Requires Zoom API keys in .env.local).',
        condition: (data) => data?.lessonType === 'live' && data?.livePlatform === 'zoom',
      },
    },
    {
      name: 'liveUrl',
      type: 'text',
      label: 'Live Class Meeting Link',
      admin: {
        description: 'Paste your Meet/Teams meeting link, or it will be auto-generated for Zoom if checked above.',
        condition: (data) => data?.lessonType === 'live',
      },
      validate: (value: any, { data }: any) => {
        if (data?.lessonType === 'live' && !data?.autoGenerateZoom && !value) {
          return 'Meeting link is required unless Auto-generate Zoom is checked.'
        }
        return true
      },
    },
    {
      name: 'liveDate',
      type: 'date',
      label: 'Scheduled Date & Time',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        condition: (data) => data?.lessonType === 'live',
        position: 'sidebar',
      },
      validate: (value: any, { data }: any) => {
        if (data?.lessonType === 'live' && !value) {
          return 'Scheduled Date & Time is required for live classes.'
        }
        return true
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
      required: true,
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
        condition: (data) => !data || data.lessonType === 'recorded',
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
