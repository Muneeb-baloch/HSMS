import {
  AnimatedIcon,
  GlassErrorCard,
  SpecialPageLayout
} from '@/components/special-pages'
import Link from 'next/link'

export default function NotFound () {
  return (
    <SpecialPageLayout>
      <GlassErrorCard>
        <div className='text-center'>
          <AnimatedIcon variant='bounce' className='mb-6 flex justify-center'>
            <svg
              className='size-15 font-extrabold text-blue-400/90'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='1.5'
              strokeLinecap='round'
              strokeLinejoin='round'
              aria-hidden
            >
              <path d='M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' />
              <path d='M9 22V12h6v10' />
            </svg>
          </AnimatedIcon>
          <h1 className='mb-2 text-3xl font-bold text-white sm:text-4xl'>
            Oops! Plot Not Found
          </h1>
          <p className='mb-8 text-white/70'>
            The resource you&apos;re looking for isn&apos;t here. Let&apos;s get
            you back home.
          </p>
          <Link
            href='/'
            className='inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3.5 font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:scale-105 hover:shadow-xl hover:shadow-blue-600/30 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900'
          >
            Back to Home
          </Link>
        </div>
      </GlassErrorCard>
    </SpecialPageLayout>
  )
}
