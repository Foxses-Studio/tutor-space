import React from 'react'
import './admin.css'

type AdminLayoutProps = {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return <>{children}</>
}
