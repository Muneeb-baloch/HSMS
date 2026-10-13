// // app/auth/google/callback/page.tsx
// 'use client'

// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle
// } from '@/components/ui/card'
// import { useGoogleAuth } from '@/lib/hooks/useGoogleAuth'
// import { Loader2 } from 'lucide-react'
// import { useSearchParams } from 'next/navigation'
// import { Suspense, useEffect } from 'react'

// function GoogleCallbackContent () {
//   const searchParams = useSearchParams()
//   const { handleGoogleCallback, isLoading, callback } = useGoogleAuth()

//   useEffect(() => {
//     const code = searchParams.get('code')
//     const state = searchParams.get('state')
//     const error = searchParams.get('error')

//     if (error) {
//       console.error('Google OAuth error:', error)
//       // Handle error - redirect to login with error message
//       window.location.href = `/login?error=${encodeURIComponent(error)}`
//       return
//     }

//     if (code && !isLoading && !callback.isPending) {
//       console.log('Processing Google callback with code:', {
//         codeLength: code.length,
//         first20Chars: code.substring(0, 20),
//         state
//       })

//       // Clear URL parameters to prevent re-processing
//       window.history.replaceState({}, document.title, window.location.pathname)

//       handleGoogleCallback(code, state || undefined)
//     } else {
//       console.log('No code found in URL')
//       window.location.href = '/login'
//     }
//   }, [searchParams, handleGoogleCallback, isLoading, callback.isPending])
//   //   if (code && !isLoading && !callback.isPending) {
//   //     handleGoogleCallback(code, state || undefined)
//   //   }
//   // }, [searchParams, handleGoogleCallback, isLoading, callback.isPending])

//   if (callback.error) {
//     return (
//       <div className='min-h-screen flex items-center justify-center bg-gray-50 p-4'>
//         <Card className='w-full max-w-md border-red-200'>
//           <CardHeader>
//             <CardTitle className='text-red-600'>
//               Authentication Failed
//             </CardTitle>
//             <CardDescription>
//               Failed to authenticate with Google. Please try again.
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <button
//               onClick={() => (window.location.href = '/login')}
//               className='w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700'
//             >
//               Back to Login
//             </button>
//           </CardContent>
//         </Card>
//       </div>
//     )
//   }

//  if (callback.isSuccess) {
//   return (
//     <div className='min-h-screen flex items-center justify-center bg-gray-50 p-4'>
//       <Card className='w-full max-w-md border-green-200'>
//         <CardHeader>
//           <CardTitle className='text-green-600'>
//             Authentication Successful
//           </CardTitle>
//           <CardDescription>Redirecting to dashboard...</CardDescription>
//         </CardHeader>
//         <CardContent className='flex justify-center'>
//           <Loader2 className='h-8 w-8 animate-spin text-green-600' />
//         </CardContent>
//       </Card>
//     </div>
//   )
// }

// }

// export default function GoogleCallbackPage () {
//   return (
//     <Suspense
//       fallback={
//         <div className='min-h-screen flex items-center justify-center'>
//           <Loader2 className='h-8 w-8 animate-spin text-blue-600' />
//         </div>
//       }
//     >
//       <GoogleCallbackContent />
//     </Suspense>
//   )
// }
// src/app/auth/google/callback/page.tsx
// src/app/(public)/auth/google/callback/page.tsx
'use client'

import { useGoogleAuth } from '@/lib/hooks/useGoogleAuth'
import { CheckCircle2, Shield, ShieldCheck, User } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

export default function GoogleCallbackPage () {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { handleGoogleCallback, callback } = useGoogleAuth()
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Process Google callback asynchronously
  const processCallback = useCallback(async () => {
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const errorParam = searchParams.get('error')

    if (errorParam) {
      // Use setTimeout to defer state update
      setTimeout(() => {
        setError(`Google authentication failed: ${errorParam}`)
      }, 0)
      return
    }

    if (!code) {
      setTimeout(() => {
        setError('No authorization code received from Google')
      }, 0)
      return
    }

    // Check if already processing
    if (isProcessing) return

    setIsProcessing(true)
    handleGoogleCallback(code, state || undefined)
  }, [searchParams, handleGoogleCallback, isProcessing])

  useEffect(() => {
    // Use requestAnimationFrame to schedule the callback
    const frameId = requestAnimationFrame(() => {
      processCallback()
    })

    return () => {
      cancelAnimationFrame(frameId)
    }
  }, [processCallback])

  // Animated step progression
  const [activeStep, setActiveStep] = useState(0)
  const steps = [
    { icon: User, label: 'Verifying identity' },
    { icon: Shield, label: 'Securing session' },
    { icon: ShieldCheck, label: 'Setting up your account' },
  ]

  useEffect(() => {
    if (!callback.isPending && !isProcessing) return
    const interval = setInterval(() => {
      setActiveStep(prev => (prev < steps.length - 1 ? prev + 1 : prev))
    }, 1200)
    return () => clearInterval(interval)
  }, [callback.isPending, isProcessing, steps.length])

  // Handle loading state
  if (callback.isPending || isProcessing) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-navy-950'>
        <div className='w-full max-w-sm mx-4'>
          {/* Google logo pulse */}
          <div className='flex justify-center mb-8'>
            <div className='relative'>
              <div className='absolute inset-0 rounded-full bg-navy-500/20 animate-ping' />
              <div className='relative size-16 rounded-full bg-navy-900 border border-navy-500/30 flex items-center justify-center shadow-lg shadow-navy-500/10'>
                <svg className='size-7' viewBox='0 0 24 24'>
                  <path fill='#4285F4' d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z' />
                  <path fill='#34A853' d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z' />
                  <path fill='#FBBC05' d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z' />
                  <path fill='#EA4335' d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z' />
                </svg>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className='glass-dark rounded-xl p-6 space-y-4'>
            {steps.map((step, i) => {
              const Icon = step.icon
              const isActive = i === activeStep
              const isDone = i < activeStep

              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 transition-all duration-500 ${
                    isActive ? 'opacity-100' : isDone ? 'opacity-60' : 'opacity-30'
                  }`}
                >
                  <div
                    className={`size-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${
                      isDone
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : isActive
                          ? 'bg-navy-500/20 text-navy-300 ring-2 ring-navy-500/40'
                          : 'bg-white/5 text-white/30'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className='size-5' />
                    ) : (
                      <Icon className={`size-5 ${isActive ? 'animate-pulse-subtle' : ''}`} />
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium transition-colors duration-500 ${
                      isDone
                        ? 'text-emerald-400'
                        : isActive
                          ? 'text-white'
                          : 'text-white/30'
                    }`}
                  >
                    {step.label}
                    {isActive && (
                      <span className='inline-flex ml-1'>
                        <span className='animate-bounce [animation-delay:0ms]'>.</span>
                        <span className='animate-bounce [animation-delay:150ms]'>.</span>
                        <span className='animate-bounce [animation-delay:300ms]'>.</span>
                      </span>
                    )}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Progress bar */}
          <div className='mt-6 h-1 bg-white/5 rounded-full overflow-hidden'>
            <div
              className='h-full bg-gradient-to-r from-navy-500 to-emerald-500 rounded-full transition-all duration-1000 ease-out'
              style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    )
  }

  if (error || callback.isError) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-navy-950'>
        <div className='w-full max-w-sm mx-4 glass-dark rounded-xl p-6 text-center'>
          <div className='size-14 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-4'>
            <Shield className='size-7 text-red-400' />
          </div>
          <h3 className='text-lg font-semibold text-white mb-1'>Authentication Failed</h3>
          <p className='text-sm text-white/50 mb-5'>
            {error || callback.error?.message || 'Unknown error occurred'}
          </p>
          <button
            onClick={() => router.push('/login')}
            className='w-full bg-navy-500 text-white py-2.5 px-4 rounded-lg hover:bg-navy-400 transition-colors text-sm font-medium'
          >
            Return to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-navy-950'>
      <div className='text-center animate-fade-in-up'>
        <div className='size-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-4'>
          <CheckCircle2 className='size-8 text-emerald-400' />
        </div>
        <h2 className='text-xl font-semibold text-white'>
          You&apos;re all set!
        </h2>
        <p className='text-white/50 mt-2 text-sm'>
          Redirecting to your dashboard...
        </p>
      </div>
    </div>
  )
}
