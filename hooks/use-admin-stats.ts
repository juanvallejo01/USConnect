"use client"

import { useState, useEffect } from "react"
import { adminApi } from "@/lib/api-client"
import type { AdminStats } from "@/types"

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        setIsLoading(true)
        const data = await adminApi.getStats()
        setStats(data)
        setError(null)
      } catch (err: any) {
        console.error('Failed to fetch admin stats:', err)
        setError(err?.message || 'Failed to load statistics')
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { stats, isLoading, error }
}
