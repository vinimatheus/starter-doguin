'use client'

import { useOrganizationContext } from '@/providers/organization-provider'
import PageContainer from '@/components/layout/page-container'
import { Skeleton } from '@/components/ui/skeleton'

export default function OverviewPage() {
  const { activeOrganization, isLoading } = useOrganizationContext()

  if (isLoading || !activeOrganization) {
    return (
      <PageContainer>
        <div className="mb-4">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <>
      </>
    </PageContainer>
  )
} 