
import { useState, useCallback } from 'react'
import { movieApi } from '@/services'

export const useStats = () => {
    const [showStats, setShowStats] = useState(false)
    const [stats, setStats] = useState(null)
    const [statsLoading, setStatsLoading] = useState(false)

    const loadStats = useCallback(async () => {
        setStatsLoading(true)
        try {
            const response = await movieApi.getStats()
            setStats(response.data || response)
            setShowStats(true)
        } catch (error) {
            throw new Error('Error loading statistics')
        } finally {
            setStatsLoading(false)
        }
    }, [])

    const handleShowStats = useCallback(async () => {
        if (!showStats) {
            await loadStats()
        } else {
            setShowStats(false)
        }
    }, [showStats, loadStats])

    return {
        showStats,
        stats,
        statsLoading,
        handleShowStats
    }
}
