import type { Metadata } from 'next'
import ForgotPasswordForm from './ForgotPasswordForm'

export const metadata: Metadata = {
  title: 'Forgot Password - Tutor Space',
  description: 'Reset your password for your Tutor Space account to regain access to your dashboard.',
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />
}
