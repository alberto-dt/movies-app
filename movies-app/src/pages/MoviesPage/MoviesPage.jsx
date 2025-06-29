import React, { Suspense, lazy } from 'react'
import styles from './styles/MoviesPage.module.css'
import {useMoviesPage} from "@/hooks";
import Loading from "@components/common/Loading/Loading";
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

    if (loading) {
        return <Loading message="Loading movies and studios..." />
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

                <MoviesGrid
                    movies={movies}
                    studiosMap={studiosMap}
                    onTransfer={handleTransferMovie}
                />
            </div>

            <Suspense fallback={null}>
                {transferDialogOpen && (
                    <TransferDialog
                        open={transferDialogOpen}
                        movie={selectedMovie}
                        studios={studios}
                        onClose={closeTransferDialog}
                        onSubmit={handleTransferSubmitWithErrorHandling}
                    />
                )}

                {notification.open && (
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
