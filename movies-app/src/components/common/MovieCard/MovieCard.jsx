import React from 'react';
import {Avatar, Box, Button, Card, Typography} from '@material-ui/core';
import SwapHorizIcon from '@material-ui/icons/SwapHoriz';
import styles from './styles/MovieCard.module.css';
import {DEFAULT_AVATAR} from "@/constants";

const MovieCard = ({movie, studioName, onTransfer}) => {
    return (
        <Card className={styles.movieCard}>
            <Avatar
                alt={movie.name || movie.title}
                src={movie.img || DEFAULT_AVATAR}
                className={styles.movieAvatar}
            />
            <div className={styles.movieInfo}>
                <Typography className={styles.movieTitle}>
                    {movie.name || movie.title}
                    {movie.position && (
                        <Typography
                            component="span"
                            className={styles.moviePosition}
                        >
                            {movie.position}
                        </Typography>
                    )}
                </Typography>
                <Typography className={styles.studioName}>
                    {studioName || 'Studio no encontrado'}
                </Typography>

                {movie.id && (
                    <Typography className={styles.movieId}>
                        ID: {movie.id}
                    </Typography>
                )}

                {movie.year && (
                    <Typography className={styles.movieYear}>
                        {movie.year}
                    </Typography>
                )}

                {movie.genre && (
                    <Typography className={styles.movieGenre}>
                        Genre: {movie.genre}
                    </Typography>
                )}
            </div>

            <Box className={styles.movieActions}>
                <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    startIcon={<SwapHorizIcon/>}
                    onClick={() => onTransfer && onTransfer(movie)}
                    className={styles.transferButton}
                >
                    Transfer
                </Button>
            </Box>
        </Card>
    );
};

export default MovieCard;
