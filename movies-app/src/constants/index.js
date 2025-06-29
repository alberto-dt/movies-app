export const API_STATES = {
    INITIAL: {
        studios: [],
        movies: [],
        loading: true,
        error: null
    },
    LOADING: {
        studios: [],
        movies: [],
        loading: true,
        error: null
    }
}
export const VALIDATION_MESSAGES = {
    NO_MOVIE: 'No movie selected',
    NO_MOVIE_ID: 'Movie identifier not found. Cannot transfer movie.',
    MISSING_STUDIOS: 'Please select both source and destination studios',
    SAME_STUDIO: 'Source and destination studios cannot be the same'
}

export const DEFAULT_AVATAR = 'https://image.shutterstock.com/image-vector/male-avatar-profile-picture-vector-600w-149083895.jpg';

export const GRID_BREAKPOINTS = {
    xs: 12,
    sm: 6,
    lg: 4
}

