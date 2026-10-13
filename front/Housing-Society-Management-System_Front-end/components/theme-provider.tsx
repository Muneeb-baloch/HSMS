// components/theme-provider.tsx - For Professional Dark/Light Mode
'use client'

import { ThemeProvider as NextThemesProvider, ThemeProviderProps } from 'next-themes'

export function ThemeProvider ({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
