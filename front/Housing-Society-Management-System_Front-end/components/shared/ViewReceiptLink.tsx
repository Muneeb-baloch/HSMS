'use client'

import { Receipt } from 'lucide-react'
import Link from 'next/link'

interface ViewReceiptLinkProps {
  targetType: 'installment' | 'bill'
  targetId: string
  className?: string
}

/**
 * Plain navigation link to the receipt resolver - deliberately does not
 * fetch anything itself (a list page can have many rows; checking receipt
 * existence eagerly for every row would be an N+1 query). The resolver
 * page does the one lookup only when the user actually clicks through,
 * and shows "no receipt found" if the row turns out to have none.
 */
export function ViewReceiptLink({ targetType, targetId, className }: ViewReceiptLinkProps) {
  return (
    <Link
      href={`/receipts/by-target/${targetType}/${targetId}`}
      className={className || 'inline-flex items-center gap-1 text-sm text-primary hover:underline'}
    >
      <Receipt className='h-3.5 w-3.5' />
      View Receipt
    </Link>
  )
}
