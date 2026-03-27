'use client'

import { SessionProvider } from 'next-auth/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GooeyToaster } from 'goey-toast'
import 'goey-toast/styles.css'
import { useState } from 'react'

export function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 1,
      },
    },
  }))

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <GooeyToaster 
          position="bottom-right"
          theme="light"
          gap={14}
          offset="24px"
          spring={true}
          bounce={0.4}
          showProgress={false}
          closeOnEscape={true}
          swipeToDismiss={true}
          dir="ltr"
        />
      </QueryClientProvider>
    </SessionProvider>
  )
}