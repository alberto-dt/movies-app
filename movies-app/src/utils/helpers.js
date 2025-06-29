export const createSuccessState = (studios, movies) => ({
    studios: Array.isArray(studios) ? studios : [],
    movies: Array.isArray(movies) ? movies : [],
    loading: false,
    error: null
})

export const createErrorState = (error) => ({
    studios: [],
    movies: [],
    loading: false,
    error: error.message
})

export const createStudiosMap = (studios) => {
    return studios.reduce((acc, studio) => {
        acc[studio.id] = studio.name;
        return acc;
    }, {});
}

export const generateMovieKey = (movie) => {
    return movie.id || `movie-${movie.name}-${movie.position}`;
}

export const getMovieId = (movie) => movie?.id || movie?.name

export const mapStudioIdToBackendKey = (studioId) => {
    const id = String(studioId);

    const idToKey = {
        "1": "disney",
        "2": "warner",
        "3": "sony"
    };

    return idToKey[id] || null;
}

export const createTransferData = (movie, fromStudio, toStudio) => ({
    movieId: getMovieId(movie),
    fromStudio,
    toStudio
})

export const getInitialFromStudio = (movie, studios) => {
    if (!movie || !studios) return ''

    const currentStudio = studios.find(studio => studio.id === movie.studioId)
    if (!currentStudio) return ''

    return mapStudioIdToBackendKey(currentStudio.id) || ''
}

export const createErrorMessage = (error) => {
    return error.response?.data?.error || error.message || 'An unexpected error occurred'
}
