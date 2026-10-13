'use client'

import React from 'react'
import PageTransition from './Animation/PageTransition'
import { RegisterSW } from './RegisterSW'

export default function ClientWrapper ({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <RegisterSW />
      <PageTransition>{children}</PageTransition>
    </>
  )
}
