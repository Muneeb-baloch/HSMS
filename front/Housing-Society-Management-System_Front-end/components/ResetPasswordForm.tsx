'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { AuthGlassCard } from '@/components/auth/AuthGlassCard'
import { AuthInput } from '@/components/auth/AuthInput'
import { GradientButton } from '@/components/auth/GradientButton'
import { PasswordInput } from '@/components/auth/PasswordInput'
import { apiClient } from '@/lib/API/client'
import { IconLock, IconShield } from '@tabler/icons-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { useToast } from './context/ToastContext'
import Link from 'next/link'

interface ResetPasswordData {
  email: string
  otp: string
  newPassword: string
  confirmPassword: string
}

export default function ResetPasswordForm () {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const { showToast } = useToast()

  const [formData, setFormData] = useState<ResetPasswordData>({
    email,
    otp: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (error) setError('')
  }

  const validateForm = (): boolean => {
    if (formData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long')
      showToast('Password must be at least 8 characters long', 'error')
      return false
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match')
      showToast('Passwords do not match', 'error')
      return false
    }
    if (formData.otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP')
      showToast('Please enter a valid 6-digit OTP', 'error')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await apiClient.resetPasswordOTP(
        formData.email,
        formData.otp,
        formData.newPassword
      )

      if (response.data.success) {
        setSuccess(response.data.message ?? 'Password reset successfully!')
        showToast('Password reset successfully!', 'success')
        setTimeout(() => {
          router.push('/login?message=Password+reset+successfully')
        }, 3000)
      }
    } catch (err: unknown) {
      let errorMessage = 'Failed to reset password'
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosError = err as { response?: { data?: { error?: string } } }
        errorMessage = axiosError.response?.data?.error ?? errorMessage
      } else if (err instanceof Error) {
        errorMessage = err.message
      }
      setError(errorMessage)
      showToast(errorMessage, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthGlassCard>
      <div className="mb-6 text-center">
        <div className="mb-3 flex justify-center">
          <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50">
            <IconShield className="size-5 text-emerald-600" aria-hidden />
          </div>
        </div>
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
          Reset Password
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Enter the OTP and your new password
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {success && (
          <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-200 text-sm">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="text-sm">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div>
          <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-slate-700 sm:text-sm">
            Email
          </label>
          <AuthInput
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled
          />
        </div>

        <div>
          <label htmlFor="otp" className="mb-1.5 block text-xs font-medium text-slate-700 sm:text-sm">
            Verification Code (6 digits)
          </label>
          <AuthInput
            id="otp"
            name="otp"
            type="text"
            inputMode="numeric"
            value={formData.otp}
            onChange={handleChange}
            placeholder="Enter 6-digit code"
            required
            maxLength={6}
            error={!!error && formData.otp.length > 0 && formData.otp.length !== 6}
          />
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-700 sm:text-sm">
            <IconLock className="size-3.5 text-slate-400" />
            New Password
          </label>
          <PasswordInput
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            placeholder="At least 8 characters"
            required
            error={!!error && formData.newPassword.length > 0 && formData.newPassword.length < 8}
          />
          <div className="mt-1.5">
            <div className="h-1 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, (formData.newPassword.length / 12) * 100)}%`,
                  background:
                    formData.newPassword.length < 6
                      ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                      : formData.newPassword.length < 8
                        ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                        : 'linear-gradient(90deg, #10b981, #059669)'
                }}
              />
            </div>
            <p className="mt-1 text-xs text-slate-400">
              {formData.newPassword.length < 6
                ? 'Weak'
                : formData.newPassword.length < 8
                  ? 'Fair'
                  : 'Strong'}
              {' — '}8+ characters recommended
            </p>
          </div>
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-700 sm:text-sm">
            <IconLock className="size-3.5 text-slate-400" />
            Confirm Password
          </label>
          <PasswordInput
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Repeat new password"
            required
            error={!!error && formData.confirmPassword.length > 0 && formData.newPassword !== formData.confirmPassword}
          />
        </div>

        <GradientButton type="submit" disabled={isLoading} isLoading={isLoading}>
          {isLoading ? 'Resetting...' : 'Reset Password'}
        </GradientButton>

        <p className="text-center">
          <Link
            href="/forgot-password"
            className="text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline sm:text-sm"
          >
            Request New OTP
          </Link>
        </p>
      </form>
    </AuthGlassCard>
  )
}
