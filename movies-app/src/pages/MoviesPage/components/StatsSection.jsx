import React, { Suspense, lazy } from 'react'
import { Box } from '@material-ui/core'
import Loading from "@components/common/Loading/Loading";

const StatsPanel = lazy(() => import("@components/common/StatsPanel/StatsPanel"))

const StatsSection = ({ showStats, stats }) => {
    if (!showStats || !stats) return null

    return (
        <Box mb={3}>
            <Suspense fallback={<Loading message="Loading stats..." />}>
                <StatsPanel stats={stats} />
            </Suspense>
        </Box>
    )
}

export default React.memo(StatsSection)
