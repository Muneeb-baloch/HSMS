import ClientWrapper from '@/components/client-wrapper'
import { ToastProvider } from '@/components/context/ToastContext'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'HSMS - Housing Society Management System | AI-Powered Society Management',
  description: 'Revolutionize your housing society management. Streamline members, plots, finances, complaints, and more with AI-powered tools. Reduce defaulters by 30%, save hours weekly.',
  keywords: ['housing society', 'society management', 'plot management', 'member management', 'defaulter tracking', 'housing SaaS'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'HSMS',
    statusBarStyle: 'default'
  },
  openGraph: {
    title: 'HSMS - Housing Society Management System',
    description: 'Revolutionize your housing society management with AI-powered tools.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HSMS - Housing Society Management System',
  },
}

export const viewport: Viewport = {
  themeColor: '#000000'
}

export default function RootLayout ({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang='en'
      className={`overflow-y-auto scrollbar-hide ${inter.className}
`}
    >
      <link rel='favicon' sizes='180x180' href='/hsms.png' />
      <body
        className={`overflow-y-auto scrollbar-hide ${inter.className}
`}
      >
        {' '}
        <Providers>
          <ToastProvider>
            <ClientWrapper>{children}</ClientWrapper>
          </ToastProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              unstyled: true,
              style: { background: 'transparent', padding: 0, border: 'none' },
            }}
            richColors={false}
            closeButton={false}
          />
        </Providers>
      </body>
    </html>
  )
}
