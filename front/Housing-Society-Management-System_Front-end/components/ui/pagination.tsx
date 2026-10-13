'use client'

import React from 'react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange
}) => {
  return (
    <div className='flex items-center justify-between p-2 border-t'>
      <span>
        Page {currentPage} of {totalPages} ({totalItems} items)
      </span>
      <div className='flex gap-2'>
        <button
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Prev
        </button>
        <button
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </button>
        <select
          value={pageSize}
          onChange={e => onPageSizeChange(Number(e.target.value))}
        >
          {[5, 10, 20, 50].map(size => (
            <option key={size} value={size}>
              {size}/page
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
