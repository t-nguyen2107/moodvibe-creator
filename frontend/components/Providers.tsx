'use client'

import { ApiProvider } from '@/contexts/ApiContext'
import { AuthProvider } from '@/components/AuthProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ApiProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ApiProvider>
  )
}
