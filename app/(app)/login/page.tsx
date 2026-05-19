import type { Metadata } from 'next'
import LoginForm from '@/app/(app)/login/LoginForm'


export const metadata: Metadata = {
  title: 'Sign In - Tutor Space',
  description: 'Access your Tutor Space account to manage courses and interactive learning sessions.',
}

export default function LoginPage() {
  return <LoginForm />
}
