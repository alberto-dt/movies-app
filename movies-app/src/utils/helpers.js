export const createStudiosMap = (studios) => {
    return studios.reduce((acc, studio) => {
        acc[studio.id] = studio.name;
        return acc;
    }, {});
};

export const generateMovieKey = (movie) => {
    return movie.id || `movie-${movie.name}-${movie.position}`;
};
