import React from 'react'
import { Typography, Button, Box } from '@material-ui/core'
import styles from '../styles/MoviesPage.module.css'

const MoviesHeader = ({ onStatsClick, statsLoading, showStats }) => (
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" className={styles.title}>
            Movies
        </Typography>
        <Button
            variant="outlined"
            color="primary"
            onClick={onStatsClick}
            disabled={statsLoading}
        >
            {statsLoading ? 'Loading...' : showStats ? 'Hide Stats' : 'Show Stats'}
        </Button>
    </Box>
)

export default React.memo(MoviesHeader)
