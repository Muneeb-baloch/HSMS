'use client'

import { CustomToast } from '@/components/ui/CustomToast'
import type { ToastType } from '@/components/ui/CustomToast'
import { createContext, ReactNode, useContext, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface Toast {
  id: string
  type: ToastType
  message: string
  duration: number
}

interface ToastContextType {
  showToast: (message: string, type: ToastType, duration?: number) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider ({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = (message: string, type: ToastType, duration = 5000) => {
    const id = crypto.randomUUID()
    setToasts(prev => [...prev, { id, message, type, duration }])

    setTimeout(() => {
      removeToast(id)
    }, duration)
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

function ToastContainer ({
  toasts,
  removeToast
}: {
  toasts: Toast[]
  removeToast: (id: string) => void
}) {
  return (
    <div className='fixed top-5 right-5 z-[100] flex flex-col gap-3 max-w-[calc(100vw-2rem)]'>
      <AnimatePresence mode='popLayout'>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            <CustomToast
              message={toast.message}
              type={toast.type}
              onDismiss={() => removeToast(toast.id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

/* ========================= */
/* Hook                      */
/* ========================= */
export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}
