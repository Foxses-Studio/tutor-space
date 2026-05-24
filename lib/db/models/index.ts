/**
 * Central Mongoose model registry.
 * Import this file in any server-side file that uses populate() or
 * references other collections. This ensures all models are registered
 * with Mongoose before any populate() calls are made.
 */

export { Course } from './Course'
export { Category } from './Category'
export { Lesson } from './Lesson'
export { Media } from './Media'
export { Review } from './Review'
export { Blog } from './Blog'
export { FAQ } from './FAQ'
export { Enrollment } from './Enrollment'
export { User } from './User'
export { Student } from './Student'
