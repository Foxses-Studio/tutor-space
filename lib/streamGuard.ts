import { cookies } from 'next/headers'
import { connectToDatabase } from '@/lib/db/mongodb'
import { Lesson } from '@/lib/db/models/Lesson'
import { Enrollment } from '@/lib/db/models/Enrollment'
import { WatchSession } from '@/lib/db/models/WatchSession'
import { verifyToken } from '@/lib/auth/auth'
import { isExternalEmbed, isAllowedOrigin, isStreamConfigured } from '@/lib/stream'

const MAX_DEVICES = Number(process.env.STREAM_MAX_DEVICES || 2)
const ACTIVE_WINDOW_MS = 5 * 60 * 1000 // a device counts as active if seen in last 5 min

export type GuardResult =
  | { ok: true; objectKey: string; userId: string }
  | { ok: false; status: number; error: string; code?: string }

/**
 * Central authorization for video streaming. Verifies domain, login, lesson,
 * enrollment and (optionally) the concurrent-device limit. Returns the R2
 * object key to stream when access is granted.
 *
 * Both the lightweight "authorize" endpoint and the byte-proxy endpoint call
 * this so the rules stay in one place.
 */
export async function guardStream(
  request: Request,
  lessonId: string,
  opts: { registerSession?: boolean } = {}
): Promise<GuardResult> {
  // 1. Domain restriction (Origin for fetch, Referer for <video> media GETs)
  if (!isAllowedOrigin(request.headers.get('origin'), request.headers.get('referer'))) {
    return { ok: false, status: 403, error: 'Forbidden origin.' }
  }

  if (!isStreamConfigured) {
    return { ok: false, status: 503, error: 'Video storage is not configured.' }
  }

  await connectToDatabase()

  // 2. Authentication
  const cookieStore = await cookies()
  const studentToken = cookieStore.get('student-token')?.value
  const payloadToken = cookieStore.get('payload-token')?.value

  let userId: string | null = null
  if (studentToken) {
    const decoded = verifyToken(studentToken)
    if (decoded?.id) userId = decoded.id
  }
  if (!userId && payloadToken) {
    const decoded = verifyToken(payloadToken)
    if (decoded?.id) userId = decoded.id
  }
  if (!userId) {
    return { ok: false, status: 401, error: 'Authentication required.' }
  }

  // 3. Lesson + video key
  const lesson = (await Lesson.findById(lessonId).lean()) as any
  if (!lesson) {
    return { ok: false, status: 404, error: 'Lesson not found.' }
  }
  if (lesson.lessonType !== 'recorded' || !lesson.videoUrl) {
    return { ok: false, status: 400, error: 'This lesson has no streamable video.' }
  }
  if (isExternalEmbed(lesson.videoUrl)) {
    return { ok: false, status: 400, error: 'This lesson uses an external player.' }
  }

  // 4. Enrollment (free preview lessons are exempt)
  if (!lesson.isPreviewable) {
    const enrollment = await Enrollment.findOne({
      student: userId,
      course: lesson.course,
      paymentStatus: 'completed',
    }).lean()
    if (!enrollment) {
      return { ok: false, status: 403, error: 'You are not enrolled in this course.' }
    }
  }

  // 5. Concurrent-device limit (only when explicitly registering a session,
  //    so frequent Range requests on the proxy don't hammer the DB)
  if (opts.registerSession) {
    const url = new URL(request.url)
    const deviceId = (url.searchParams.get('d') || request.headers.get('x-device-id') || '').trim()
    if (deviceId) {
      const cutoff = new Date(Date.now() - ACTIVE_WINDOW_MS)
      const activeSessions = await WatchSession.find({
        user: userId,
        lastSeen: { $gte: cutoff },
      }).lean()

      const activeDeviceIds = new Set(activeSessions.map((s: any) => s.deviceId))
      if (!activeDeviceIds.has(deviceId) && activeDeviceIds.size >= MAX_DEVICES) {
        return {
          ok: false,
          status: 429,
          code: 'DEVICE_LIMIT',
          error: `Device limit reached. You can stream on at most ${MAX_DEVICES} device(s) at a time. Stop playback on another device and try again.`,
        }
      }

      await WatchSession.updateOne(
        { user: userId, deviceId },
        { $set: { lastSeen: new Date(), userAgent: request.headers.get('user-agent') || undefined } },
        { upsert: true }
      )
    }
  }

  return { ok: true, objectKey: lesson.videoUrl, userId }
}
