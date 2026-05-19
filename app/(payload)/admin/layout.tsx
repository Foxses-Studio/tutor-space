import React from 'react'
import '@/app/(app)/globals.css'
import './admin.css'

type AdminLayoutProps = {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="admin-custom-wrapper min-h-screen bg-[#fafafa]">
      {children}
    </div>
  )
}
