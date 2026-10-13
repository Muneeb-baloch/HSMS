'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PaymentModeAnalysisPage () {
  const router = useRouter()

  useEffect(() => {
    router.replace('/paymentmodes/summary')
  }, [router])

  return (
    <div className='flex items-center justify-center min-h-[200px]'>
      <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary' />
    </div>
  )
}
