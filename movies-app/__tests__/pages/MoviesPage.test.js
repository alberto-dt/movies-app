import React from 'react'
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import MoviesPage from '@pages/MoviesPage/MoviesPage'
import { useMoviesPage } from '@hooks/useMoviesPage'
import { useMovieFilters } from '@hooks/useMovieFilters'
import { movieApi } from '@services/movieApi'

// Mock de todos los hooks y dependencias
jest.mock('@hooks/useMoviesPage')
jest.mock('@hooks/useMovieFilters')
jest.mock('@services/movieApi')

// Mock de los componentes lazy
jest.mock('@components/common/TransferDialog/TransferDialog', () => {
    return function MockTransferDialog({ open, movie, studios, onClose, onSubmit }) {
        if (!open) return null
        return (
            <div data-testid="transfer-dialog">
                <h3>Transfer Dialog</h3>
                <p>Movie: {movie?.name}</p>
                <p>Studios: {studios?.length || 0}</p>
                <button onClick={onClose}>Close</button>
                <button onClick={() => onSubmit({ movieId: movie?.id, fromStudio: 'test', toStudio: 'test2' })}>
                    Submit Transfer
                </button>
            </div>
        )
    }
})

jest.mock('@components/common/NotificationSnackbar/NotificationSnackbar', () => {
    return function MockNotificationSnackbar({ notification, onClose }) {
        if (!notification?.open) return null
        return (
            <div data-testid="notification-snackbar">
                <p>{notification.message}</p>
                <button onClick={onClose}>Close Notification</button>
            </div>
        )
    }
})

// Mock de componentes regulares
jest.mock('@components/common/Loading/Loading', () => {
    return function MockLoading({ message }) {
        return <div data-testid="loading">{message}</div>
    }
})

jest.mock('@components/common/MovieFilters/MovieFilters', () => {
    return function MockMovieFilters({
                                         filters,
                                         filterOptions,
                                         onUpdateFilter,
                                         onUpdatePriceRange,
                                         onResetFilters,
                                         hasActiveFilters,
                                         totalResults,
                                         totalMovies,
                                         isSearching
                                     }) {
        return (
            <div data-testid="movie-filters">
                <p>Active Filters: {hasActiveFilters ? 'Yes' : 'No'}</p>
                <p>Total Results: {totalResults}</p>
                <p>Total Movies: {totalMovies}</p>
                <p>Is Searching: {isSearching ? 'Yes' : 'No'}</p>
                <button onClick={() => onUpdateFilter('title', 'test')}>Update Filter</button>
                <button onClick={() => onUpdatePriceRange({ min: 0, max: 1000 })}>Update Price</button>
                <button onClick={onResetFilters}>Reset Filters</button>
            </div>
        )
    }
})

jest.mock('@pages/MoviesPage/components/MoviesHeader', () => {
    return function MockMoviesHeader({ onStatsClick, statsLoading, showStats }) {
        return (
            <div data-testid="movies-header">
                <button onClick={onStatsClick} disabled={statsLoading}>
                    {showStats ? 'Hide Stats' : 'Show Stats'}
                </button>
                {statsLoading && <span>Loading stats...</span>}
            </div>
        )
    }
})

jest.mock('@pages/MoviesPage/components/StatsSection', () => {
    return function MockStatsSection({ showStats, stats }) {
        if (!showStats) return null
        return (
            <div data-testid="stats-section">
                <h3>Stats</h3>
                {stats && <p>Total Movies: {stats.totalMovies}</p>}
            </div>
        )
    }
})

jest.mock('@pages/MoviesPage/components/MoviesGrid', () => {
    return function MockMoviesGrid({ movies, studiosMap, onTransfer }) {
        return (
            <div data-testid="movies-grid">
                <p>Movies Count: {movies?.length || 0}</p>
                <p>Studios Map: {Object.keys(studiosMap || {}).length} studios</p>
                {movies?.map(movie => (
                    <div key={movie.id} data-testid={`movie-${movie.id}`}>
                        <span>{movie.name}</span>
                        <button onClick={() => onTransfer(movie)}>Transfer</button>
                    </div>
                ))}
            </div>
        )
    }
})

// Mock de estilos CSS modules
jest.mock('@pages/MoviesPage/styles/MoviesPage.module.css', () => ({
    moviesPage: 'moviesPage',
    moviesContainer: 'moviesContainer'
}))

describe('MoviesPage', () => {
    // Datos mock
    const mockMovies = [
        { id: '11', name: 'Nightmare before christmas', genre: 6, price: 600 },
        { id: '12', name: 'Aladdin', genre: 4, price: 10000000000 }
    ]

    const mockStudios = [
        { id: '1', name: 'Disney studios', shortName: 'Disney' },
        { id: '2', name: 'Warner Bros.', shortName: 'Warner' }
    ]

    const mockStudiosMap = {
        '1': mockStudios[0],
        '2': mockStudios[1]
    }

    const mockStats = {
        totalMovies: 12,
        totalStudios: 3,
        averagePrice: 2167167167.25
    }

    // Mock por defecto de useMoviesPage
    const defaultUseMoviesPageMock = {
        studios: mockStudios,
        movies: mockMovies,
        loading: false,
        studiosMap: mockStudiosMap,
        showStats: false,
        stats: null,
        statsLoading: false,
        handleStatsClick: jest.fn(),
        transferDialogOpen: false,
        selectedMovie: null,
        handleTransferMovie: jest.fn(),
        closeTransferDialog: jest.fn(),
        handleTransferSubmitWithErrorHandling: jest.fn(),
        notification: { open: false },
        hideNotification: jest.fn()
    }

    // Mock por defecto de useMovieFilters
    const defaultUseMovieFiltersMock = {
        filters: {},
        filteredMovies: mockMovies,
        filterOptions: { studios: mockStudios, genres: [] },
        updateFilter: jest.fn(),
        updatePriceRange: jest.fn(),
        resetFilters: jest.fn(),
        hasActiveFilters: false,
        totalResults: 2,
        totalMovies: 2,
        isSearching: false,
        setBackendFilteredResults: jest.fn(),
        setSearching: jest.fn()
    }

    beforeEach(() => {
        jest.clearAllMocks()
        useMoviesPage.mockReturnValue(defaultUseMoviesPageMock)
        useMovieFilters.mockReturnValue(defaultUseMovieFiltersMock)
        movieApi.searchMoviesWithFilters.mockResolvedValue(mockMovies)
    })

    describe('Loading States', () => {
        it('should show loading when data is loading', () => {
            useMoviesPage.mockReturnValue({
                ...defaultUseMoviesPageMock,
                loading: true
            })

            render(<MoviesPage />)

            expect(screen.getByTestId('loading')).toBeInTheDocument()
            expect(screen.getByText('Loading movies and studios...')).toBeInTheDocument()
        })

        it('should show searching loading when isSearching is true', () => {
            useMovieFilters.mockReturnValue({
                ...defaultUseMovieFiltersMock,
                isSearching: true
            })

            render(<MoviesPage />)

            expect(screen.getByTestId('loading')).toBeInTheDocument()
            expect(screen.getByText('Searching movies...')).toBeInTheDocument()
        })
    })

    describe('Error States', () => {
        it('should show error message when no movies data available', () => {
            useMoviesPage.mockReturnValue({
                ...defaultUseMoviesPageMock,
                movies: []
            })

            render(<MoviesPage />)

            expect(screen.getByText('No movies data available')).toBeInTheDocument()
            expect(screen.getByText('Please check your API connection')).toBeInTheDocument()
        })

        it('should show error message when movies is not an array', () => {
            useMoviesPage.mockReturnValue({
                ...defaultUseMoviesPageMock,
                movies: null
            })

            render(<MoviesPage />)

            expect(screen.getByText('No movies data available')).toBeInTheDocument()
        })
    })

    describe('Successful Render', () => {
        it('should render all main components when data is available', () => {
            render(<MoviesPage />)

            expect(screen.getByTestId('movies-header')).toBeInTheDocument()
            expect(screen.getByTestId('movie-filters')).toBeInTheDocument()
            expect(screen.getByTestId('movies-grid')).toBeInTheDocument()
        })

        it('should pass correct props to MoviesHeader', () => {
            render(<MoviesPage />)

            const header = screen.getByTestId('movies-header')
            expect(header).toBeInTheDocument()

            // Verificar que el botón existe y no está deshabilitado
            const statsButton = screen.getByRole('button', { name: /show stats/i })
            expect(statsButton).not.toBeDisabled()
        })

        it('should pass correct props to MovieFilters', () => {
            render(<MoviesPage />)

            const filters = screen.getByTestId('movie-filters')
            expect(filters).toBeInTheDocument()
            expect(screen.getByText('Active Filters: No')).toBeInTheDocument()
            expect(screen.getByText('Total Results: 2')).toBeInTheDocument()
            expect(screen.getByText('Total Movies: 2')).toBeInTheDocument()
            expect(screen.getByText('Is Searching: No')).toBeInTheDocument()
        })

        it('should pass correct props to MoviesGrid', () => {
            render(<MoviesPage />)

            const grid = screen.getByTestId('movies-grid')
            expect(grid).toBeInTheDocument()
            expect(screen.getByText('Movies Count: 2')).toBeInTheDocument()
            expect(screen.getByText('Studios Map: 2 studios')).toBeInTheDocument()
        })
    })

    describe('Stats functionality', () => {
        it('should show stats section when showStats is true', () => {
            useMoviesPage.mockReturnValue({
                ...defaultUseMoviesPageMock,
                showStats: true,
                stats: mockStats
            })

            render(<MoviesPage />)

            expect(screen.getByTestId('stats-section')).toBeInTheDocument()
            expect(screen.getByText('Total Movies: 12')).toBeInTheDocument()
        })

        it('should handle stats button click', () => {
            const mockHandleStatsClick = jest.fn()
            useMoviesPage.mockReturnValue({
                ...defaultUseMoviesPageMock,
                handleStatsClick: mockHandleStatsClick
            })

            render(<MoviesPage />)

            const statsButton = screen.getByRole('button', { name: /show stats/i })
            fireEvent.click(statsButton)

            expect(mockHandleStatsClick).toHaveBeenCalledTimes(1)
        })

        it('should show loading state in stats button', () => {
            useMoviesPage.mockReturnValue({
                ...defaultUseMoviesPageMock,
                statsLoading: true
            })

            render(<MoviesPage />)

            const statsButton = screen.getByRole('button', { name: /show stats/i })
            expect(statsButton).toBeDisabled()
            expect(screen.getByText('Loading stats...')).toBeInTheDocument()
        })
    })

    describe('Filter functionality', () => {
        it('should handle filter updates', () => {
            const mockUpdateFilter = jest.fn()
            useMovieFilters.mockReturnValue({
                ...defaultUseMovieFiltersMock,
                updateFilter: mockUpdateFilter
            })

            render(<MoviesPage />)

            const updateButton = screen.getByText('Update Filter')
            fireEvent.click(updateButton)

            expect(mockUpdateFilter).toHaveBeenCalledWith('title', 'test')
        })

        it('should handle price range updates', () => {
            const mockUpdatePriceRange = jest.fn()
            useMovieFilters.mockReturnValue({
                ...defaultUseMovieFiltersMock,
                updatePriceRange: mockUpdatePriceRange
            })

            render(<MoviesPage />)

            const updatePriceButton = screen.getByText('Update Price')
            fireEvent.click(updatePriceButton)

            expect(mockUpdatePriceRange).toHaveBeenCalledWith({ min: 0, max: 1000 })
        })

        it('should handle filter reset', () => {
            const mockResetFilters = jest.fn()
            useMovieFilters.mockReturnValue({
                ...defaultUseMovieFiltersMock,
                resetFilters: mockResetFilters
            })

            render(<MoviesPage />)

            const resetButton = screen.getByText('Reset Filters')
            fireEvent.click(resetButton)

            expect(mockResetFilters).toHaveBeenCalledTimes(1)
        })

        it('should show active filters state', () => {
            useMovieFilters.mockReturnValue({
                ...defaultUseMovieFiltersMock,
                hasActiveFilters: true,
                totalResults: 1
            })

            render(<MoviesPage />)

            expect(screen.getByText('Active Filters: Yes')).toBeInTheDocument()
            expect(screen.getByText('Total Results: 1')).toBeInTheDocument()
        })
    })

    describe('Transfer Dialog', () => {
        it('should show transfer dialog when transferDialogOpen is true', async () => {
            useMoviesPage.mockReturnValue({
                ...defaultUseMoviesPageMock,
                transferDialogOpen: true,
                selectedMovie: mockMovies[0]
            })

            render(<MoviesPage />)

            await waitFor(() => {
                expect(screen.getByTestId('transfer-dialog')).toBeInTheDocument()
            })

            expect(screen.getByText('Movie: Nightmare before christmas')).toBeInTheDocument()
            expect(screen.getByText('Studios: 2')).toBeInTheDocument()
        })

        it('should handle transfer movie click', () => {
            const mockHandleTransferMovie = jest.fn()
            useMoviesPage.mockReturnValue({
                ...defaultUseMoviesPageMock,
                handleTransferMovie: mockHandleTransferMovie
            })

            render(<MoviesPage />)

            const transferButton = screen.getAllByText('Transfer')[0]
            fireEvent.click(transferButton)

            expect(mockHandleTransferMovie).toHaveBeenCalledWith(mockMovies[0])
        })

        it('should handle transfer dialog close', async () => {
            const mockCloseTransferDialog = jest.fn()
            useMoviesPage.mockReturnValue({
                ...defaultUseMoviesPageMock,
                transferDialogOpen: true,
                selectedMovie: mockMovies[0],
                closeTransferDialog: mockCloseTransferDialog
            })

            render(<MoviesPage />)

            await waitFor(() => {
                const closeButton = screen.getByText('Close')
                fireEvent.click(closeButton)
            })

            expect(mockCloseTransferDialog).toHaveBeenCalledTimes(1)
        })

        it('should handle transfer submit', async () => {
            const mockHandleTransferSubmit = jest.fn()
            useMoviesPage.mockReturnValue({
                ...defaultUseMoviesPageMock,
                transferDialogOpen: true,
                selectedMovie: mockMovies[0],
                handleTransferSubmitWithErrorHandling: mockHandleTransferSubmit
            })

            render(<MoviesPage />)

            await waitFor(() => {
                const submitButton = screen.getByText('Submit Transfer')
                fireEvent.click(submitButton)
            })

            expect(mockHandleTransferSubmit).toHaveBeenCalledWith({
                movieId: '11',
                fromStudio: 'test',
                toStudio: 'test2'
            })
        })
    })

    describe('Notification', () => {
        it('should show notification when notification.open is true', async () => {
            useMoviesPage.mockReturnValue({
                ...defaultUseMoviesPageMock,
                notification: {
                    open: true,
                    message: 'Transfer successful!',
                    type: 'success'
                }
            })

            render(<MoviesPage />)

            await waitFor(() => {
                expect(screen.getByTestId('notification-snackbar')).toBeInTheDocument()
            })

            expect(screen.getByText('Transfer successful!')).toBeInTheDocument()
        })

        it('should handle notification close', async () => {
            const mockHideNotification = jest.fn()
            useMoviesPage.mockReturnValue({
                ...defaultUseMoviesPageMock,
                notification: {
                    open: true,
                    message: 'Transfer successful!'
                },
                hideNotification: mockHideNotification
            })

            render(<MoviesPage />)

            await waitFor(() => {
                const closeButton = screen.getByText('Close Notification')
                fireEvent.click(closeButton)
            })

            expect(mockHideNotification).toHaveBeenCalledTimes(1)
        })

        it('should not show notification when notification.open is false', () => {
            useMoviesPage.mockReturnValue({
                ...defaultUseMoviesPageMock,
                notification: { open: false }
            })

            render(<MoviesPage />)

            expect(screen.queryByTestId('notification-snackbar')).not.toBeInTheDocument()
        })
    })

    describe('Backend Search Integration', () => {
        it('should call movieApi.searchMoviesWithFilters when filters change', async () => {
            const mockSetBackendFilteredResults = jest.fn()
            const mockSetSearching = jest.fn()

            useMovieFilters.mockReturnValue({
                ...defaultUseMovieFiltersMock,
                hasActiveFilters: true,
                filters: { title: 'test' },
                setBackendFilteredResults: mockSetBackendFilteredResults,
                setSearching: mockSetSearching
            })

            render(<MoviesPage />)

            // Esperar a que se ejecute el efecto con timeout
            await waitFor(() => {
                expect(movieApi.searchMoviesWithFilters).toHaveBeenCalledWith({ title: 'test' })
            }, { timeout: 500 })

            expect(mockSetBackendFilteredResults).toHaveBeenCalledWith(mockMovies)
        })

        it('should handle search API error gracefully', async () => {
            const mockSetBackendFilteredResults = jest.fn()
            movieApi.searchMoviesWithFilters.mockRejectedValue(new Error('API Error'))

            useMovieFilters.mockReturnValue({
                ...defaultUseMovieFiltersMock,
                hasActiveFilters: true,
                filters: { title: 'test' },
                setBackendFilteredResults: mockSetBackendFilteredResults
            })

            render(<MoviesPage />)

            await waitFor(() => {
                expect(mockSetBackendFilteredResults).toHaveBeenCalledWith([])
            }, { timeout: 500 })
        })

        it('should not search when hasActiveFilters is false', async () => {
            const mockSetBackendFilteredResults = jest.fn()

            useMovieFilters.mockReturnValue({
                ...defaultUseMovieFiltersMock,
                hasActiveFilters: false,
                setBackendFilteredResults: mockSetBackendFilteredResults
            })

            render(<MoviesPage />)

            await waitFor(() => {
                expect(mockSetBackendFilteredResults).toHaveBeenCalledWith(mockMovies)
            }, { timeout: 500 })

            expect(movieApi.searchMoviesWithFilters).not.toHaveBeenCalled()
        })
    })

    describe('Edge Cases', () => {
        it('should handle empty studios array gracefully', () => {
            useMoviesPage.mockReturnValue({
                ...defaultUseMoviesPageMock,
                studios: [],
                studiosMap: {}
            })

            render(<MoviesPage />)

            expect(screen.getByTestId('movies-grid')).toBeInTheDocument()
            expect(screen.getByText('Studios Map: 0 studios')).toBeInTheDocument()
        })

        it('should handle null studios gracefully', () => {
            useMoviesPage.mockReturnValue({
                ...defaultUseMoviesPageMock,
                studios: null,
                studiosMap: null
            })

            render(<MoviesPage />)

            expect(screen.getByTestId('movies-grid')).toBeInTheDocument()
            expect(screen.getByText('Studios Map: 0 studios')).toBeInTheDocument()
        })

        it('should handle movies array changes', () => {
            const { rerender } = render(<MoviesPage />)

            // Cambiar los datos de películas
            useMoviesPage.mockReturnValue({
                ...defaultUseMoviesPageMock,
                movies: [mockMovies[0]] // Solo una película
            })

            useMovieFilters.mockReturnValue({
                ...defaultUseMovieFiltersMock,
                filteredMovies: [mockMovies[0]]
            })

            rerender(<MoviesPage />)

            expect(screen.getByText('Movies Count: 1')).toBeInTheDocument()
        })
    })
})
