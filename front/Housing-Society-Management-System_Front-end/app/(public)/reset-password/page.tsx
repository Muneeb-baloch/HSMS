'use client'

import { AuthPageLayout } from '@/components/auth/AuthPageLayout'
import ResetPasswordForm from '@/components/ResetPasswordForm'

export default function ResetPasswordPage () {
  return (
    <AuthPageLayout>
      <ResetPasswordForm />
    </AuthPageLayout>
  )
}
