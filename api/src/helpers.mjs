import {GENRE_STRING} from '../constants/studio_constants.mjs'


export const getAllMoviesFromStudios = (studios) => {
  if (!Array(studios)) {
    throw new Error('Studios must be an array');
  }

  return studios.flatMap(studio => {
    if (!studio.movies || !Array.isArray(studio.movies)) {
      console.log(`Studio ${studio.id || 'unknown'} has no movies`);
      return [];
    }
    return studio.movies
        .filter(movie => movie && typeof movie === 'object')
        .map(movie => movieConstructor(movie, studio));
  });
};

export const movieConstructor = (movie, studio) => {
  if(!movie || typeof movie !== 'object'){
    throw new Error('Movie must be an object valid');
  }

  if(!studio || !studio.id){
    throw new Error('Studio must be an object with a valid id');
  }

  const processedMovie = {...movie}
  if(processedMovie.url) {
    processedMovie.img = processedMovie.url;
    delete processedMovie.url;
  }

  if(typeof processedMovie.position === "number" && GENRE_STRING(processedMovie.position)) {
    processedMovie.position = GENRE_STRING[processedMovie.position];
  }

  processedMovie.studioId = studio.id;

  const unwantedProperties = ['price'];
  unwantedProperties.forEach(prop => {
    delete processedMovie[prop];
  });

  return processedMovie;
}






export const transferMovie = (movieId,fromStudioId,toStudioId, studios) => {
  if(!movieId || !fromStudioId || !toStudioId || !Array.isArray(studios)){
    return {
      success: false,
      error: 'Invalid parameters'
    };
  }

  if(fromStudioId === toStudioId){
    return {
      success: false,
        error: 'Cannot transfer movie to the same studio'
    };
  }

  const fromStudio = studios.find(s=>s.id === fromStudioId);
  const toStudio = studios.find(s => s.id === toStudioId);

  if(!fromStudio){
    return {
      success: false,
      error: 'Studio origin not found'
    };
  }

  if(!toStudio){
    return {
      success: false,
      error: 'Studio destination not found'
    };
  }

  const movieIndex = fromStudio.movies?.findIndex(movie => movie.id === movieId);

  if(movieIndex === -1 || movieIndex === undefined){
    return {
      success: false,
        error: 'Movie not found in the origin studio'
    };
  }

  const movie = fromStudio.movies[movieIndex];

  fromStudio.movies.splice(movieIndex,1);

  if(!toStudio.movies){
    toStudio.movies = [];
  }
  toStudio.movies.push(movie);

  return {
    success: true,
    message: `Movie ${movieId} transferred from ${fromStudio.name} to ${toStudio.name}`,
    movie: movieConstructor(movie, toStudio)
  };
};

export const getMovieStats = (studios) => {
  if (!Array.isArray(studios)) {
    return null;
  }

  const stats = {
    totalMovies: 0,
    moviesByStudio: {},
    moviesByGenre: {},
    studiosCount: studios.length
  };

  studios.forEach(studio => {
    const movieCount = studio.movies?.length || 0;
    stats.totalMovies += movieCount;
    stats.moviesByStudio[studio.name || studio.id] = movieCount;
    studio.movies?.forEach(movie => {
      if (movie.genre) {
        stats.moviesByGenre[movie.genre] = (stats.moviesByGenre[movie.genre] || 0) + 1;
      }
    });
  });

  return stats;
};
