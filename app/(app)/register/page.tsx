import type { Metadata } from 'next'
import RegisterForm from '@/app/(app)/register/RegisterForm'


export const metadata: Metadata = {
  title: 'Sign Up - Tutor Space',
  description: 'Create a free Tutor Space account to unlock interactive premium e-learning courses.',
}

export default function RegisterPage() {
  return <RegisterForm />
}
