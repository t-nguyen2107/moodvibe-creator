'use client'

import { ApiProvider } from '@/contexts/ApiContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ApiProvider>
      {children}
    </ApiProvider>
  )
}
