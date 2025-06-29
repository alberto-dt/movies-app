import React, { useCallback } from 'react'
import { Grid } from '@material-ui/core'
import MovieCard from "@components/common/MovieCard/MovieCard";
import {GRID_BREAKPOINTS} from "@/constants";

const MovieGridItem = ({ movie, studioName, onTransfer }) => {
    const handleTransfer = useCallback(() => {
        onTransfer(movie)
    }, [movie, onTransfer])

    return (
        <Grid
            item
            xs={GRID_BREAKPOINTS.xs}
            sm={GRID_BREAKPOINTS.sm}
            lg={GRID_BREAKPOINTS.lg}
        >
            <MovieCard
                movie={movie}
                studioName={studioName}
                onTransfer={handleTransfer}
            />
        </Grid>
    )
}

export default React.memo(MovieGridItem)
