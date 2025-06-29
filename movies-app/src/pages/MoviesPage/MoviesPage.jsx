import React, { Suspense, lazy, useEffect, useCallback } from 'react'
import Loading from "@components/common/Loading/Loading"
import MovieFilters from "@components/common/MovieFilters/MovieFilters"
import { useMoviesPage } from "@hooks/useMoviesPage"
import { useMovieFilters } from "@hooks/useMovieFilters"
import { movieApi } from "@services/movieApi"
import styles from './styles/MoviesPage.module.css'
import MoviesHeader from "@pages/MoviesPage/components/MoviesHeader";
import StatsSection from "@pages/MoviesPage/components/StatsSection";
import MoviesGrid from "@pages/MoviesPage/components/MoviesGrid";

const TransferDialog = lazy(() => import("@components/common/TransferDialog/TransferDialog"))
const NotificationSnackbar = lazy(() => import("@components/common/NotificationSnackbar/NotificationSnackbar"))

const MoviesPage = () => {
    const {
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
    } = useMoviesPage()

    // Hook de filtros con soporte para backend
    const {
        filters,
        filteredMovies,
        filterOptions,
        updateFilter,
        updatePriceRange,
        resetFilters,
        hasActiveFilters,
        totalResults,
        totalMovies,
        isSearching,
        setBackendFilteredResults,
        setSearching
    } = useMovieFilters(Array.isArray(movies) ? movies : [])

    const performBackendSearch = useCallback(async (currentFilters) => {
        if (!hasActiveFilters) {
            setBackendFilteredResults(movies)
            return
        }

        setSearching(true)

        try {

            const results = await movieApi.searchMoviesWithFilters(currentFilters)

            setBackendFilteredResults(results || [])
        } catch (error) {
            setBackendFilteredResults([])
        }
    }, [hasActiveFilters, movies, setBackendFilteredResults, setSearching])

    useEffect(() => {
        if (Array.isArray(movies) && movies.length > 0) {
            const timeoutId = setTimeout(() => {
                performBackendSearch(filters)
            }, 300)

            return () => clearTimeout(timeoutId)
        }
    }, [filters, movies, performBackendSearch])

    if (loading) {
        return <Loading message="Loading movies and studios..." />
    }

    const hasValidData = Array.isArray(movies) && movies.length > 0
    const hasValidStudios = Array.isArray(studios) && studios.length > 0

    if (!hasValidData) {
        return (
            <div className={styles.moviesPage}>
                <div className={styles.moviesContainer}>
                    <MoviesHeader
                        onStatsClick={handleStatsClick}
                        statsLoading={statsLoading}
                        showStats={showStats}
                    />
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <h3>No movies data available</h3>
                        <p>Please check your API connection</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.moviesPage}>
            <div className={styles.moviesContainer}>
                <MoviesHeader
                    onStatsClick={handleStatsClick}
                    statsLoading={statsLoading}
                    showStats={showStats}
                />

                <StatsSection
                    showStats={showStats}
                    stats={stats}
                />

                <Suspense fallback={<Loading message="Loading filters..." />}>
                    <MovieFilters
                        filters={filters}
                        filterOptions={filterOptions}
                        onUpdateFilter={updateFilter}
                        onUpdatePriceRange={updatePriceRange}
                        onResetFilters={resetFilters}
                        hasActiveFilters={hasActiveFilters}
                        totalResults={totalResults}
                        totalMovies={totalMovies}
                        isSearching={isSearching}
                    />
                </Suspense>

                {isSearching ? (
                    <Loading message="Searching movies..." />
                ) : (
                    <MoviesGrid
                        movies={filteredMovies}
                        studiosMap={hasValidStudios ? studiosMap : {}}
                        onTransfer={handleTransferMovie}
                    />
                )}
            </div>

            <Suspense fallback={null}>
                {transferDialogOpen && selectedMovie && (
                    <TransferDialog
                        open={transferDialogOpen}
                        movie={selectedMovie}
                        studios={studios || []}
                        onClose={closeTransferDialog}
                        onSubmit={handleTransferSubmitWithErrorHandling}
                    />
                )}

                {notification?.open && (
                    <NotificationSnackbar
                        notification={notification}
                        onClose={hideNotification}
                    />
                )}
            </Suspense>
        </div>
    )
}

export default MoviesPage
