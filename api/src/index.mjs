import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import {getFilterData, getMovieStats, transferMovie} from './helpers.mjs'
import {disney, movieAge, sony, warner} from '../constants/studio_constants.mjs'
import logger from './utils/logger.mjs';
import { requestLoggingMiddleware, errorLoggingMiddleware } from './middleware/loggingMiddleware.mjs';

const app = express();
const PORT = process.env.PORT || 3002;

logger.info('Iniciando servidor de Movies App', {
  puerto: PORT,
  entorno: process.env.NODE_ENV || 'development',
  node_version: process.version
});

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 *1000,
  max:100,
  message: 'Too many requests, please try again later.',
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      url: req.url,
      userAgent: req.get('User-Agent')
    });
    res.status(429).json({
      success: false,
      error: 'Too many requests, please try again later.'
    });
  }
});

app.use(limiter);

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

app.use(express.json({limit:'10mb'}));
app.use(express.urlencoded({extended: true, limit:'10mb'}));

app.use(requestLoggingMiddleware);

let studiosCache = null;
let moviesCache = null;
let filterDataCache = null;
let cacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000;

const isCacheValid = () => {
  const isValid = cacheTime && (Date.now() - cacheTime) < CACHE_DURATION;
  logger.debug('Cache validation', {
    isValid: isValid,
    timeCache: Date.now() - cacheTime
  });
  return isValid;
};

const refreshCache = () => {
  const startTime = Date.now();

  try {
    logger.info('Refreshing data cache');

    studiosCache = [disney, warner, sony].map(studio => {
      const { movies, ...studioWithoutMovies } = studio;
      return studioWithoutMovies;
    });

    filterDataCache = getFilterData([disney, warner, sony]);
    moviesCache = filterDataCache.movies;
    cacheTime = Date.now();

    const duration = Date.now() - startTime;
    logger.logCache('refreshed', {
      duration: duration,
      movies: moviesCache.length,
      studies: studiosCache.length,
      genres: filterDataCache.genres.length
    });

    logger.info('Cache refreshed successfully', {
      moviesTotal: moviesCache.length,
      studiesTotal: studiosCache.length
    });

  } catch (error) {
    logger.error('Error refreshing cache', error);
    throw error;
  }
};

const getCachedData = (type) => {
  if (!isCacheValid()) {
    logger.debug('Invalid cache, refreshing');
    refreshCache();
  } else {
    logger.logCache('hit', { type: type });
  }

  switch (type) {
    case 'studios':
      return studiosCache;
    case 'movies':
      return moviesCache;
    case 'filterData':
      return filterDataCache;
    default:
      logger.warn('Unknown cache type requested', { type: type });
      return null;
  }
};

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

app.get('/studios', asyncHandler(async (req, res) => {
  logger.debug('requesting list of studies');
  const studios = getCachedData('studios');

  res.json({
    success: true,
    data: studios,
    count: studios.length
  });
}));

app.get('/movies', asyncHandler(async (req, res) => {
  logger.debug('Requesting movie list', {
    filtros: req.query
  });

  let filteredMovies = getCachedData('movies');
  const originalCount = filteredMovies.length;

  if (req.query.title) {
    const titleQuery = req.query.title.toLowerCase();
    filteredMovies = filteredMovies.filter(movie =>
        (movie.title && movie.title.toLowerCase().includes(titleQuery)) ||
        (movie.name && movie.name.toLowerCase().includes(titleQuery))
    );
    logger.debug('Filter by title applied', {
      title: req.query.title,
      results: filteredMovies.length
    });
  }

  if (req.query.studio) {
    const studioQuery = req.query.studio.toLowerCase();
    filteredMovies = filteredMovies.filter(movie => {
      const studioName = movie.studio?.toLowerCase() || '';
      const studioId = movie.studioId?.toString().toLowerCase() || '';
      return studioName.includes(studioQuery) || studioId === studioQuery;
    });
    logger.debug('Filter by applied study', {
      studio: req.query.studio,
      results: filteredMovies.length
    });
  }

  if (req.query.minPrice || req.query.maxPrice) {
    const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : 0;
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : Infinity;

    filteredMovies = filteredMovies.filter(movie => {
      const price = movie.price || 0;
      return price >= minPrice && price <= maxPrice;
    });

    logger.debug('Filter by applied price', {
      minPrice: minPrice,
      maxPrice: maxPrice,
      results: filteredMovies.length
    });
  }

  logger.info('Movie query completed', {
    originalCount: originalCount,
    totalFiltered: filteredMovies.length,
    filtersApplied: Object.keys(req.query).length
  });

  res.json({
    success: true,
    data: filteredMovies,
    count: filteredMovies.length,
    filtered: filteredMovies.length !== originalCount
  });
}));

app.get('/genres', asyncHandler(async (req, res) => {
  logger.debug('Requesting list of genres');
  const filterData = getCachedData('filterData');

  res.json({
    success: true,
    data: filterData.genres,
    count: filterData.genres.length
  });
}));

app.get('/filter-data', asyncHandler(async (req, res) => {
  logger.debug('Requesting filter data');
  const filterData = getCachedData('filterData');

  res.json({
    success: true,
    data: filterData
  });
}));

app.get('/movieAge', asyncHandler(async (req, res) => {
  logger.debug('Requesting age data for films');
  res.json({
    success: true,
    data: movieAge
  });
}));

app.post('/transfer', asyncHandler(async (req, res) => {
  const { movieId, fromStudio, toStudio } = req.body;

  logger.info('Transfer request received', {
    movie: movieId,
    fromStudio: fromStudio,
    toStudio: toStudio,
    ip: req.ip
  });

  if (!movieId || !fromStudio || !toStudio) {
    logger.warn('Transfer rejected: missing parameters', {
      received: req.body
    });
    return res.status(400).json({
      success: false,
      error: 'movieId, fromStudio, and toStudio are required.',
      received: req.body
    });
  }

  if (fromStudio === toStudio) {
    logger.warn('Transfer rejected: same study', {
      movie: movieId,
      studio: fromStudio
    });
    return res.status(400).json({
      success: false,
      error: 'The origin and destination studies cannot be the same'
    });
  }

  const studioMap = {
    'disney': disney,
    'warner': warner,
    'sony': sony
  };

  const fromStudioObj = studioMap[fromStudio.toLowerCase()];
  const toStudioObj = studioMap[toStudio.toLowerCase()];

  if (!fromStudioObj) {
    logger.error('Invalid origin study', {
      fromStudio: fromStudio,
      availableStudies: Object.keys(studioMap)
    });
    return res.status(400).json({
      success: false,
      error: `Invalid source studio '${fromStudio}'. Available studios: Disney, Warner, Sony`
    });
  }

  if (!toStudioObj) {
    logger.error('Invalid destination study', {
      fromStudio: toStudio,
      availableStudies: Object.keys(studioMap)
    });
    return res.status(400).json({
      success: false,
      error: `Invalid destination studio '${toStudio}'. Available studios: Disney, Warner, Sony`
    });
  }

  const result = transferMovie(
      movieId,
      fromStudioObj.id,
      toStudioObj.id,
      [disney, warner, sony]
  );

  if (result.success) {
    studiosCache = null;
    moviesCache = null;
    filterDataCache = null;
    cacheTime = 0;

    logger.logCache('invalidated', { reason: 'successful transfer' });

    res.json({
      success: true,
      message: result.message,
      data: {
        transferredMovie: result.movie,
        fromStudio: fromStudio,
        toStudio: toStudio
      }
    });
  } else {
    logger.error('Failed transfer', null, {
      movie: movieId,
      error: result.error
    });
    res.status(400).json({
      success: false,
      error: result.error
    });
  }
}));

app.get('/stats', asyncHandler(async (req, res) => {
  logger.debug('Requesting movie statistics');
  const stats = getMovieStats([disney, warner, sony]);

  res.json({
    success: true,
    data: stats
  });
}));

app.get('/movies/:id', asyncHandler(async (req, res) => {
  const movieId = req.params.id;
  logger.debug('Searching for movie by ID', { movieId: movieId });

  const movies = getCachedData('movies');
  const foundMovie = movies.find(movie => movie.id === movieId);

  if (!foundMovie) {
    logger.warn('Movie not found', { movieId: movieId });
    return res.status(404).json({
      success: false,
      error: `Movie with ID ${movieId} not found`
    });
  }

  logger.info('Movie found', {
    movieId: movieId,
    name: foundMovie.name
  });

  res.json({
    success: true,
    data: foundMovie
  });
}));

app.get('/health', (req, res) => {
  logger.debug('Health check requested');
  const filterData = getCachedData('filterData');

  const healthData = {
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version,
    cache: {
      moviesCount: filterData.movies.length,
      studiosCount: filterData.studios.length,
      genresCount: filterData.genres.length,
      cacheAge: Date.now() - cacheTime
    }
  };

  logger.info('Health check completed', healthData.cache);
  res.json(healthData);
});

app.use((req, res) => {
  logger.warn('Route not found', {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip
  });

  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      'GET /studios',
      'GET /movies',
      'GET /movies/:id',
      'GET /genres',
      'GET /filter-data',
      'GET /movieAge',
      'GET /stats',
      'POST /transfer',
      'GET /health'
    ]
  });
});

app.use(errorLoggingMiddleware);

const gracefulShutdown = () => {
  logger.info('Closing Movies App server gracefully');
  process.exit(0);
};

process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received');
  gracefulShutdown();
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received');
  gracefulShutdown();
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Promise rejection not handled', new Error(reason), {
    promise: promise.toString()
  });
});

app.listen(PORT, () => {
  refreshCache();
  logger.info(`Movies App server successfully started on port ${PORT}`, {
    entorno: process.env.NODE_ENV || 'development',
    pid: process.pid
  });
});
