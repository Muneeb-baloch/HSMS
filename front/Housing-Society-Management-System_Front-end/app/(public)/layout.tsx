'use client'

import ProtectedRoute from '../ProtectedRoute'

export default function PublicLayout ({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute requireAuth={false}>
      <div className='min-h-screen'>
        {children}
      </div>
    </ProtectedRoute>
  )
}
