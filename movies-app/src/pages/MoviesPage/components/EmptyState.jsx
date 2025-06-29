import React from 'react'
import { Typography, Box } from '@material-ui/core'
import { Movie } from '@material-ui/icons'

const EmptyState = ({ message, description }) => (
    <Box textAlign="center" py={8}>
        <Movie
            style={{
                fontSize: 64,
                color: '#ccc',
                marginBottom: 16
            }}
        />
        <Typography variant="h5" color="textSecondary" gutterBottom>
            {message || 'No movies found'}
        </Typography>
        <Typography variant="body1" color="textSecondary">
            {description || 'Check back later for new releases'}
        </Typography>
    </Box>
)

export default React.memo(EmptyState)
