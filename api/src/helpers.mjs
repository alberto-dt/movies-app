import {GENRE_ID, GENRE_STRING} from '../constants/studio_constants.mjs'

export const getAllMoviesFromStudios = (studios) => {
  if (!Array.isArray(studios)) {
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
  if (!movie || typeof movie !== 'object') {
    throw new Error('Movie must be an object valid');
  }

  if (!studio || !studio.id) {
    throw new Error('Studio must be an object with a valid id');
  }

  const processedMovie = {...movie};

  if (processedMovie.url) {
    processedMovie.img = processedMovie.url;
    delete processedMovie.url;
  }

  if (typeof processedMovie.genre === "number" && GENRE_STRING[processedMovie.genre]) {
    processedMovie.genre = mapGenreIdToString(processedMovie.genre);
  } else if (!processedMovie.genre) {
    processedMovie.genre = 'Unknown';
  }

  processedMovie.studioId = studio.id;
  processedMovie.studio = studio.name || `Studio ${studio.id}`;

  if (!processedMovie.year) {
    processedMovie.year = generateRealisticYear();
  }

  if (!processedMovie.price || processedMovie.price <= 0 || processedMovie.price > 1000) {
    processedMovie.price = generateRealisticPrice();
  }

  const unwantedProperties = ['position'];
  unwantedProperties.forEach(prop => {
    delete processedMovie[prop];
  });

  return processedMovie;
};

const mapGenreIdToString = (genreId) => {
  const genreMap = {
    [GENRE_ID.adventures]: 'Adventure',
    [GENRE_ID.horror]: 'Horror',
    [GENRE_ID.animation]: 'Animation',
    [GENRE_ID.heroes]: 'Action'
  };

  return genreMap[genreId] || 'Unknown';
};

const generateRealisticPrice = () => {
  const basePrices = [9.99, 12.99, 14.99, 19.99, 24.99, 29.99, 34.99, 39.99];
  return basePrices[Math.floor(Math.random() * basePrices.length)];
};

const generateRealisticYear = () => {
  const currentYear = new Date().getFullYear();
  const startYear = 1990;
  return Math.floor(Math.random() * (currentYear - startYear + 1)) + startYear;
};

export const getAllGenres = (studios) => {
  if (!Array.isArray(studios)) {
    return [];
  }

  const genres = new Set();

  studios.forEach(studio => {
    if (Array.isArray(studio.movies)) {
      studio.movies.forEach(movie => {
        const processedMovie = movieConstructor(movie, studio);
        if (processedMovie.genre && processedMovie.genre !== 'Unknown') {
          genres.add(processedMovie.genre);
        }
      });
    }
  });

  return Array.from(genres).sort();
};

export const getFilterData = (studios) => {
  if (!Array.isArray(studios)) {
    return {
      studios: [],
      movies: [],
      genres: []
    };
  }

  const movies = getAllMoviesFromStudios(studios);
  const genres = getAllGenres(studios);

  const formattedStudios = studios.map(studio => ({
    id: studio.id,
    name: studio.name || studio.shortName || `Studio ${studio.id}`,
    shortName: studio.shortName || studio.name
  }));

  return {
    studios: formattedStudios,
    movies: movies,
    genres: genres
  };
};

export const transferMovie = (movieId, fromStudioId, toStudioId, studios) => {
  if (!movieId || !fromStudioId || !toStudioId || !Array.isArray(studios)) {
    return {
      success: false,
      error: 'Invalid parameters'
    };
  }

  if (fromStudioId === toStudioId) {
    return {
      success: false,
      error: 'Cannot transfer movie to the same studio'
    };
  }

  const fromStudio = studios.find(s => s.id === fromStudioId);
  const toStudio = studios.find(s => s.id === toStudioId);

  if (!fromStudio) {
    return {
      success: false,
      error: 'Studio origin not found'
    };
  }

  if (!toStudio) {
    return {
      success: false,
      error: 'Studio destination not found'
    };
  }

  const movieIndex = fromStudio.movies?.findIndex(movie => movie.id === movieId);

  if (movieIndex === -1 || movieIndex === undefined) {
    return {
      success: false,
      error: 'Movie not found in the origin studio'
    };
  }

  const movie = fromStudio.movies[movieIndex];

  fromStudio.movies.splice(movieIndex, 1);

  if (!toStudio.movies) {
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
      const processedMovie = movieConstructor(movie, studio);
      if (processedMovie.genre && processedMovie.genre !== 'Unknown') {
        stats.moviesByGenre[processedMovie.genre] = (stats.moviesByGenre[processedMovie.genre] || 0) + 1;
      }
    });
  });

  return stats;
};
