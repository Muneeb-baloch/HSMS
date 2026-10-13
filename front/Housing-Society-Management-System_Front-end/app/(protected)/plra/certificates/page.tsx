'use client'

import CertificateList from '@/components/plra/CertificateList'

export default function CertificatesPage () {
  return (
    <div className='flex flex-1 flex-col overflow-auto p-6'>
      <CertificateList />
    </div>
  )
}
