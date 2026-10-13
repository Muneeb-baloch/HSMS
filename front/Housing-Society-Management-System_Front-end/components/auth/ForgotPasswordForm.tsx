'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { AuthGlassCard } from '@/components/auth/AuthGlassCard'
import { AuthInput } from '@/components/auth/AuthInput'
import { GradientButton } from '@/components/auth/GradientButton'
import { apiClient } from '@/lib/API/client'
import { IconMail, IconShield } from '@tabler/icons-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useToast } from '../context/ToastContext'
import Link from 'next/link'

export default function ForgotPasswordForm () {
  const { showToast } = useToast()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateEmail(email)) {
      showToast('Please enter a valid email address', 'error')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await apiClient.forgotPassword(email)

      if (response.data.success) {
        setSuccess(response.data.message)
        showToast(response.data.message, 'success')
        setTimeout(() => {
          router.push(`/reset-password?email=${encodeURIComponent(email)}`)
        }, 2000)
      }
    } catch (err: unknown) {
      setSuccess(
        'If an account exists, password reset OTP has been sent to your email'
      )
      let errorMessage = 'Account exists failed to reset password OTP'
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosError = err as { response?: { data?: { error?: string } } }
        errorMessage = axiosError.response?.data?.error ?? errorMessage
      } else if (err instanceof Error) {
        errorMessage = err.message
      }
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
          Forgot Password?
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Enter your email and we&apos;ll send a reset code
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {success && (
          <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-200 text-sm">
            <AlertDescription>
              <div className="flex flex-col gap-1">
                <span>{success}</span>
                <span className="text-xs text-emerald-300/80">
                  Redirecting to reset password...
                </span>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="text-sm">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div>
          <label
            htmlFor="email"
            className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-700 sm:text-sm"
          >
            <IconMail className="size-3.5 text-slate-400" />
            Email Address
          </label>
          <AuthInput
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => {
              setEmail(e.target.value)
              if (error) setError('')
            }}
            required
            disabled={isLoading}
            error={!!error}
          />
        </div>

        <GradientButton type="submit" disabled={isLoading || !email} isLoading={isLoading}>
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </GradientButton>

        <p className="text-center">
          <Link
            href="/login"
            className="text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline sm:text-sm"
          >
            Back to Login
          </Link>
        </p>
      </form>
    </AuthGlassCard>
  )
}
