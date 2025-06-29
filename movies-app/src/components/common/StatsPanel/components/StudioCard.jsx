import React from 'react';
import {Card, CardContent, Paper, Typography} from '@material-ui/core';
import styles from '../styles/StatsPanel.module.css';

const StudioCard = ({studio}) => (
    <Card className={styles.studioCard}>
        <CardContent>
            <Typography className={styles.studioName}>
                {studio.name}
            </Typography>
            <Paper className={styles.movieChip}>
                {studio.movieCount || 0} movies
            </Paper>

            {studio.movies && studio.movies.length > 0 && (
                <div className={styles.moviesList}>
                    <Typography variant="body2" className={styles.moviesTitle}>
                        Movies:
                    </Typography>
                    {studio.movies.map((movie, idx) => (
                        <Typography
                            key={idx}
                            variant="body2"
                            className={styles.movieItem}
                        >
                            • {movie.title || movie.name || movie}
                        </Typography>
                    ))}
                </div>
            )}
        </CardContent>
    </Card>
);

export default StudioCard;
