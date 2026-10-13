// components/shared/ErrorBoundary/UploadErrorBoundary.tsx
'use client'

import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onReset?: () => void
}

interface State {
  hasError: boolean
  error: Error | null
}

export class UploadErrorBoundary extends Component<Props, State> {
  constructor (props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError (error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch (error: Error, errorInfo: ErrorInfo) {
    console.error('Upload Error Boundary caught an error:', error, errorInfo)
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null })
    this.props.onReset?.()
  }

  render () {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className='rounded-lg border border-destructive/20 bg-destructive/5 p-4'>
          <div className='flex items-start gap-3'>
            <AlertTriangle className='h-5 w-5 text-destructive mt-0.5' />
            <div className='flex-1 space-y-2'>
              <h3 className='font-medium text-destructive'>Upload Error</h3>
              <p className='text-sm text-muted-foreground'>
                {this.state.error?.message ||
                  'Something went wrong with the upload.'}
              </p>
              <div className='flex gap-2 pt-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={this.resetErrorBoundary}
                >
                  <RefreshCw className='mr-2 h-4 w-4' />
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
