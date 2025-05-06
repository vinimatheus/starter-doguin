'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function SettingsPage() {
  const router = useRouter()
  const params = useParams()
  const organizationId = params.organizationId as string

  useEffect(() => {
    router.replace(`/dashboard/${organizationId}/settings/profile`)
  }, [router, organizationId])

  return null
} 