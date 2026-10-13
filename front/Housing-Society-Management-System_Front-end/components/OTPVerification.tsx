'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'

interface OTPVerificationProps {
  email: string
  onVerify: (otp: string) => Promise<void>
  onResend: () => Promise<void>
  isLoading?: boolean
  isResending?: boolean
}

export function OTPVerification ({
  email,
  onVerify,
  onResend,
  isLoading = false,
  isResending = false
}: OTPVerificationProps) {
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== 6) {
      setError('Please enter a 6-digit OTP')
      return
    }
    setError('')
    await onVerify(otp)
  }

  const handleResend = async () => {
    setError('')
    await onResend()
  }

  return (
    <div className='space-y-6'>
      <div className='text-center'>
        <h3 className='text-lg font-semibold'>Verify Your Email</h3>
        <p className='text-sm text-gray-600 mt-2'>
          Enter the 6-digit code sent to {email}
        </p>
      </div>

      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <Input
            type='text'
            placeholder='Enter 6-digit OTP'
            value={otp}
            onChange={e => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 6)
              setOtp(value)
              if (error) setError('')
            }}
            className='enhanced-input h-11'
            maxLength={6}
            disabled={isLoading}
          />
          {error && <p className='text-sm text-red-500 mt-2'>{error}</p>}
        </div>

        <Button
          type='submit'
          className='w-full'
          disabled={otp.length !== 6 || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Verifying...
            </>
          ) : (
            'Verify OTP'
          )}
        </Button>

        <div className='text-center'>
          <Button
            type='button'
            variant='link'
            onClick={handleResend}
            disabled={isResending}
          >
            {isResending ? 'Resending...' : "Didn't receive code? Resend"}
          </Button>
          <p className='text-xs text-gray-500 mt-2'>
            OTP expires in 10 minutes
          </p>
        </div>
      </form>
    </div>
  )
}
