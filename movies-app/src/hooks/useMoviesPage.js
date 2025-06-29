import { useMemo, useCallback } from 'react'
import { createStudiosMap, createErrorMessage } from '@/utils'
import { useApiData, useStats, useTransfer, useNotification } from './index'

export const useMoviesPage = () => {
    const { studios, movies, loading, refreshData } = useApiData()
    const { notification, showNotification, hideNotification } = useNotification()
    const { showStats, stats, statsLoading, handleShowStats } = useStats()
    const {
        transferDialogOpen,
        selectedMovie,
        handleTransferMovie,
        handleTransferSubmit,
        closeTransferDialog
    } = useTransfer(refreshData)

    const studiosMap = useMemo(() =>
        createStudiosMap(studios || []), [studios]
    )

    const handleStatsClick = useCallback(async () => {
        try {
            await handleShowStats()
        } catch (error) {
            showNotification(error.message, 'error')
        }
    }, [handleShowStats, showNotification])

    const handleTransferSubmitWithErrorHandling = useCallback(async (transferData) => {
        try {
            const message = await handleTransferSubmit(transferData)
            showNotification(message, 'success')
        } catch (error) {
            showNotification(createErrorMessage(error), 'error')
        }
    }, [handleTransferSubmit, showNotification])

    return {
        studios,
        movies,
        loading,
        studiosMap,
        showStats,
        stats,
        statsLoading,
        handleStatsClick,
        transferDialogOpen,
        selectedMovie,
        handleTransferMovie,
        closeTransferDialog,
        handleTransferSubmitWithErrorHandling,
        notification,
        hideNotification
    }
}
