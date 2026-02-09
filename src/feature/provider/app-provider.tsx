import type { PropsWithChildren } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/shadcn/tanstack-query'
import { dialogService } from '../service/app-container'

export function AppProvider(props: PropsWithChildren) {

  return <QueryClientProvider client={queryClient}>
    <dialogService.Collection />
    {props.children}
  </QueryClientProvider>
}
