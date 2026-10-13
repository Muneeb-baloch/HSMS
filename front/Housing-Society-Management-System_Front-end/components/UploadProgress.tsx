// frontend/src/lib/upload/components/UploadProgress.tsx
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle, Loader2, XCircle } from 'lucide-react'

interface UploadProgressProps {
  fileName: string
  progress: number
  status?: 'uploading' | 'success' | 'error' | 'pending'
  error?: string
  onRetry?: () => void
  className?: string
}

export function UploadProgress ({
  fileName,
  progress,
  status = 'uploading',
  error,
  onRetry,
  className
}: UploadProgressProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className='h-4 w-4 text-green-500' />
      case 'error':
        return <XCircle className='h-4 w-4 text-red-500' />
      case 'pending':
        return <AlertCircle className='h-4 w-4 text-yellow-500' />
      default:
        return <Loader2 className='h-4 w-4 animate-spin text-blue-500' />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'bg-green-500'
      case 'error':
        return 'bg-red-500'
      case 'pending':
        return 'bg-yellow-500'
      default:
        return 'bg-blue-500'
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'success':
        return 'Uploaded'
      case 'error':
        return 'Failed'
      case 'pending':
        return 'Pending'
      default:
        return 'Uploading'
    }
  }

  return (
    <div className={cn('space-y-2 rounded-lg border p-4', className)}>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-3'>
          {getStatusIcon()}
          <div className='min-w-0 flex-1'>
            <p className='truncate text-sm font-medium text-gray-900'>
              {fileName}
            </p>
            <p className='text-xs text-gray-500'>
              {getStatusText()} • {Math.round(progress)}%
            </p>
          </div>
        </div>

        {status === 'error' && onRetry && (
          <button
            type='button'
            onClick={onRetry}
            className='text-sm font-medium text-blue-600 hover:text-blue-500'
          >
            Retry
          </button>
        )}
      </div>

      <Progress value={progress} className={getStatusColor()} />

      {error && <p className='text-xs text-red-600'>{error}</p>}

      {status === 'uploading' && progress < 100 && (
        <p className='text-xs text-gray-500'>
          Please don&apos;t close this window
        </p>
      )}
    </div>
  )
}
