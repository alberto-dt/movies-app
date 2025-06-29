import React from 'react';
import {Box, Grid, Typography} from '@material-ui/core';
import styles from '../styles/StatsPanel.module.css';
import StudioCard from "@components/common/StatsPanel/components/StudioCard";

const StudiosBreakdown = ({moviesByStudio}) => {
    if (!moviesByStudio || Object.keys(moviesByStudio).length === 0) {
        return null;
    }

    const studiosArray = Object.entries(moviesByStudio).map(([name, count]) => ({
        id: name.toLowerCase().replace(/\s+/g, '-'), // Generar un ID simple
        name: name,
        movieCount: count
    }));

    return (
        <Box className={styles.studiosSection}>
            <Typography variant="h6" gutterBottom className={styles.studiosBreadkownTitle}>
                Studios Breakdown
            </Typography>
            <Grid container spacing={2}>
                {studiosArray.map((studio, index) => (
                    <Grid item xs={12} sm={6} md={4} key={studio.id || index}>
                        <StudioCard studio={studio}/>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default StudiosBreakdown;
