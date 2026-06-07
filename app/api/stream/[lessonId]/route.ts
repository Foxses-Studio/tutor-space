import { NextResponse } from 'next/server'
import { guardStream } from '@/lib/streamGuard'

type Props = {
  params: Promise<{ lessonId: string }>
}

/**
 * Authorize endpoint. The player calls this first to verify access and register
 * the device (concurrent-device limit). It deliberately returns NO video URL —
 * playback bytes come from the same-origin proxy at `/api/stream/[lessonId]/play`,
 * so the real R2 URL is never exposed to the browser / devtools.
 */
export async function GET(request: Request, { params }: Props) {
  try {
    const { lessonId } = await params
    const result = await guardStream(request, lessonId, { registerSession: true })
    if (!result.ok) {
      return NextResponse.json({ error: result.error, code: result.code }, { status: result.status })
    }
    return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error: any) {
    console.error('Stream authorize error:', error)
    return NextResponse.json({ error: error.message || 'Streaming failed.' }, { status: 500 })
  }
}
