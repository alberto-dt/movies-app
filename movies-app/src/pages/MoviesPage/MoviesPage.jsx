import React, { useMemo } from 'react';
import { Grid, Typography } from '@material-ui/core';
import styles from './MoviesPage.module.css';
import {useApiData} from "../../hooks/useApiData";
import {createStudiosMap, generateMovieKey} from "../../utils/helpers";
import Loading from "../../components/common/Loading/Loading";
import {GRID_BREAKPOINTS} from "../../utils/constants";
import MovieCard from "../../components/common/MovieCard/MovieCard";

const MoviesPage = () => {
    const { studios, movies, loading } = useApiData(true);

    const studiosMap = useMemo(() => {
        return createStudiosMap(studios);
    }, [studios]);

    if (loading) {
        return <Loading message="Loading movies and studios..." />;
    }

    return (
        <div className={styles.moviesPage}>
            <div className={styles.moviesContainer}>
                <Typography variant="h4" component="h1" className={styles.title}>
                    Movies Gallery
                </Typography>
                <Grid container justifyContent="center" alignItems="stretch">
                    {movies.map(movie => (
                        <Grid
                            item
                            xs={GRID_BREAKPOINTS.xs}
                            sm={GRID_BREAKPOINTS.sm}
                            lg={GRID_BREAKPOINTS.lg}
                            key={generateMovieKey(movie)}
                        >
                            <MovieCard
                                movie={movie}
                                studioName={studiosMap[movie.studioId]}
                            />
                        </Grid>
                    ))}
                </Grid>
            </div>
        </div>
    );
};

export default MoviesPage;
