import React from 'react';
import { Avatar, Card, Typography } from '@material-ui/core';
import { DEFAULT_AVATAR } from '../../../utils/constants';
import styles from './MovieCard.module.css';

const MovieCard = ({ movie, studioName }) => {
    return (
        <Card className={styles.movieCard}>
            <Avatar
                alt={movie.name}
                src={movie.img || DEFAULT_AVATAR}
                className={styles.movieAvatar}
            />
            <div className={styles.movieInfo}>
                <Typography className={styles.movieTitle}>
                    {movie.name}
                    <Typography
                        component="span"
                        className={styles.moviePosition}
                    >
                        {movie.position}
                    </Typography>
                </Typography>
                <Typography className={styles.studioName}>
                    {studioName || 'Studio no encontrado'}
                </Typography>
            </div>
        </Card>
    );
};

export default MovieCard;
