import { useState, useCallback } from 'react'
import { movieApi } from '@/services'

const validateTransferData = (transferData) => {
    const requiredFields = [
        { field: 'movieId', name: 'Movie ID/Name' },
        { field: 'fromStudio', name: 'From studio' },
        { field: 'toStudio', name: 'To studio' }
    ]

    for (const { field, name } of requiredFields) {
        if (!transferData[field]) {
            throw new Error(`${name} is missing`)
        }
    }
}

export const useTransfer = (refreshData) => {
    const [transferDialogOpen, setTransferDialogOpen] = useState(false)
    const [selectedMovie, setSelectedMovie] = useState(null)

    const handleTransferMovie = useCallback((movie) => {
        setSelectedMovie(movie)
        setTransferDialogOpen(true)
    }, [])

    const handleTransferSubmit = useCallback(async (transferData) => {
        validateTransferData(transferData)

        const response = await movieApi.transferMovie(
            transferData.movieId,
            transferData.fromStudio,
            transferData.toStudio
        )

        refreshData()
        setTransferDialogOpen(false)
        setSelectedMovie(null)

        return response.message || 'Movie transferred successfully!'
    }, [refreshData])

    const closeTransferDialog = useCallback(() => {
        setTransferDialogOpen(false)
        setSelectedMovie(null)
    }, [])

    return {
        transferDialogOpen,
        selectedMovie,
        handleTransferMovie,
        handleTransferSubmit,
        closeTransferDialog
    }
}
