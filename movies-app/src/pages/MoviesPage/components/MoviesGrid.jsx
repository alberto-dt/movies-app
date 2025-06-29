import React from 'react'
import { Grid } from '@material-ui/core'


import {generateMovieKey} from "@/utils";
import EmptyState from "@pages/MoviesPage/components/EmptyState";
import MovieGridItem from "@pages/MoviesPage/components/MovieGridItem";

const MoviesGrid = ({ movies, studiosMap, onTransfer }) => {
    if (!movies?.length) {
        return <EmptyState />
    }

    return (
        <Grid container justifyContent="center" alignItems="stretch">
            {movies.map(movie => (
                <MovieGridItem
                    key={generateMovieKey(movie)}
                    movie={movie}
                    studioName={studiosMap[movie.studioId]}
                    onTransfer={onTransfer}
                />
            ))}
        </Grid>
    )
}

export default React.memo(MoviesGrid)
