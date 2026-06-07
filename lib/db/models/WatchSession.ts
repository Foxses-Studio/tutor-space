import mongoose, { Schema, Document } from 'mongoose'

/**
 * Tracks active viewing devices per user so we can limit how many devices can
 * stream course videos at the same time (session validation / anti account-sharing).
 *
 * A "device" is identified by a persistent id the browser stores in localStorage
 * and sends with every stream request. We refresh `lastSeen` on each request and
 * treat a device as inactive once `lastSeen` is older than the activity window.
 */
export interface IWatchSession extends Document {
  user: mongoose.Types.ObjectId | string
  deviceId: string
  userAgent?: string
  lastSeen: Date
}

const WatchSessionSchema = new Schema<IWatchSession>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    deviceId: { type: String, required: true },
    userAgent: { type: String },
    lastSeen: { type: Date, default: Date.now },
  },
  { collection: 'watch_sessions', timestamps: true }
)

// One row per (user, device)
WatchSessionSchema.index({ user: 1, deviceId: 1 }, { unique: true })
// Auto-expire stale sessions after 24h so the collection stays small
WatchSessionSchema.index({ lastSeen: 1 }, { expireAfterSeconds: 60 * 60 * 24 })

export const WatchSession =
  mongoose.models.WatchSession || mongoose.model<IWatchSession>('WatchSession', WatchSessionSchema)
