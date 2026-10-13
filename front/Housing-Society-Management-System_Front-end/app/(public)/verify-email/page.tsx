'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { AuthGlassCard } from '@/components/auth/AuthGlassCard'
import { GradientButton } from '@/components/auth/GradientButton'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot
} from '@/components/ui/input-otp'
import { useResendRegistrationOTP } from '@/lib/hooks/useResendRegistrationOTP'
import { useVerifyRegistrationOTP } from '@/lib/hooks/useVerifyRegistrationOTP'
import { IconMail, IconShield } from '@tabler/icons-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AuthPageLayout } from '@/components/auth/AuthPageLayout'

const OTP_SLOT_CLASS =
  'h-10 w-10 sm:h-11 sm:w-11 border-slate-300 bg-white text-slate-900 text-sm font-medium data-[active=true]:border-emerald-600 data-[active=true]:ring-2 data-[active=true]:ring-emerald-500/30 data-[active=true]:bg-emerald-50'

export default function VerifyEmailPage () {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const tempUserId = searchParams.get('tempUserId')

  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

  const {
    verifyOTP,
    isPending: isVerifying,
    isError: isVerifyError,
    error: verifyError
  } = useVerifyRegistrationOTP()

  const {
    resendOTP,
    isPending: isResending,
    isError: isResendError,
    error: resendError
  } = useResendRegistrationOTP()

  useEffect(() => {
    if (isVerifyError && verifyError) {
      setError(verifyError.message)
    }
  }, [isVerifyError, verifyError])

  useEffect(() => {
    if (isResendError && resendError) {
      setError(resendError.message)
    }
  }, [isResendError, resendError])

  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setInterval(() => setResendCooldown(c => c - 1), 1000)
    return () => clearInterval(t)
  }, [resendCooldown])

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError('Please enter a 6-digit OTP')
      return
    }

    if (!tempUserId) {
      setError('Invalid session. Please register again.')
      return
    }

    setError('')
    setSuccess('')

    try {
      await verifyOTP({ tempUserId, otp })
      setSuccess('Email verified successfully! Redirecting to login...')
      setTimeout(() => router.push('/login?verified=true'), 2000)
    } catch {
      // Error handled by hook / useEffect
    }
  }

  const handleResendOTP = async () => {
    if (!tempUserId || resendCooldown > 0 || isResending) return

    setError('')
    setSuccess('')

    try {
      const result = await resendOTP(tempUserId)
      setSuccess('New OTP sent to your email')
      setResendCooldown(60)
      if (result?.tempUserId) {
        const newUrl = new URL(window.location.href)
        newUrl.searchParams.set('tempUserId', result.tempUserId)
        window.history.replaceState({}, '', newUrl.toString())
      }
    } catch {
      // Error handled by useEffect
    }
  }

  if (!email || !tempUserId) {
    return (
      <AuthPageLayout>
        <div className="flex items-center justify-center py-12">
          <div
            className="size-10 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600"
            aria-hidden
          />
          <span className="sr-only">Loading...</span>
        </div>
      </AuthPageLayout>
    )
  }

  return (
    <AuthPageLayout>
      <AuthGlassCard>
        <div className="mb-6 text-center">
          <div className="mb-3 flex justify-center">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50">
              <IconShield className="size-5 text-emerald-600" aria-hidden />
            </div>
          </div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
            Verify Your Email
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Enter the 6-digit code sent to your email
          </p>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg bg-emerald-50 px-3 py-2.5 text-center">
            <div className="flex items-center justify-center gap-2 text-slate-700">
              <IconMail className="size-4 text-emerald-600" />
              <span className="text-sm font-medium">{email}</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Check your inbox for the verification code
            </p>
          </div>

          {error && (
            <Alert className="text-sm">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-200 text-sm">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={setOtp}
              disabled={isVerifying}
              containerClassName="gap-1.5 sm:gap-2"
              className="[&_svg]:text-slate-400"
            >
              <InputOTPGroup className="gap-1 sm:gap-1.5">
                <InputOTPSlot index={0} className={OTP_SLOT_CLASS} />
                <InputOTPSlot index={1} className={OTP_SLOT_CLASS} />
                <InputOTPSlot index={2} className={OTP_SLOT_CLASS} />
              </InputOTPGroup>
              <InputOTPSeparator className="text-slate-300" />
              <InputOTPGroup className="gap-1 sm:gap-1.5">
                <InputOTPSlot index={3} className={OTP_SLOT_CLASS} />
                <InputOTPSlot index={4} className={OTP_SLOT_CLASS} />
                <InputOTPSlot index={5} className={OTP_SLOT_CLASS} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <GradientButton
            type="button"
            onClick={handleVerify}
            disabled={otp.length !== 6 || isVerifying}
            isLoading={isVerifying}
            loadingText="Verifying..."
          >
            Verify Email
          </GradientButton>

          <div className="text-center">
            <p className="text-sm text-slate-500">
              Didn&apos;t receive the code?{' '}
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resendCooldown > 0 || isResending}
                className="font-medium text-emerald-600 hover:text-emerald-700 hover:underline disabled:opacity-50"
              >
                {resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : isResending
                    ? 'Resending...'
                    : 'Resend OTP'}
              </button>
            </p>
            <p className="mt-1 text-xs text-slate-400">OTP expires in 10 minutes</p>
          </div>

          <div className="pt-2">
            <Link
              href="/signup"
              className="block text-center text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline sm:text-sm"
            >
              Back to Signup
            </Link>
          </div>
        </div>
      </AuthGlassCard>
    </AuthPageLayout>
  )
}
