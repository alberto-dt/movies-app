import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import {getFilterData, getMovieStats, transferMovie} from './helpers.mjs'
import {disney, movieAge, sony, warner} from '../constants/studio_constants.mjs'

const app = express();

const PORT = process.env.PORT || 3002;

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 *1000,
  max:100,
  message: 'Too many requests, please try again later.',
});

app.use(limiter);

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

app.use(express.json({limit:'10mb'}));
app.use(express.urlencoded({extended: true, limit:'10mb'}));

app.use((req,res, next) =>{
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} ${req.method} ${req.url}`);
  next();
});

let studiosCache = null;
let moviesCache = null;
let filterDataCache = null;
let cacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000;

const isCacheValid = () => {
  return cacheTime && (Date.now() - cacheTime) < CACHE_DURATION;
};

const refreshCache = () => {
  try {

    studiosCache = [disney, warner, sony].map(studio => {
      const { movies, ...studioWithoutMovies } = studio;
      return studioWithoutMovies;
    });

    filterDataCache = getFilterData([disney, warner, sony]);

    moviesCache = filterDataCache.movies;

    cacheTime = Date.now();

  } catch (error) {
    throw error;
  }
};

const getCachedData = (type) => {
  if (!isCacheValid()) {
    refreshCache();
  }

  switch (type) {
    case 'studios':
      return studiosCache;
    case 'movies':
      return moviesCache;
    case 'filterData':
      return filterDataCache;
    default:
      return null;
  }
};

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

app.get('/studios', asyncHandler(async (req, res) => {
  const studios = getCachedData('studios');

  res.json({
    success: true,
    data: studios,
    count: studios.length
  });
}));

app.get('/movies', asyncHandler(async (req, res) => {
  let filteredMovies = getCachedData('movies');

  if (req.query.title) {
    const titleQuery = req.query.title.toLowerCase();
    filteredMovies = filteredMovies.filter(movie =>
        (movie.title && movie.title.toLowerCase().includes(titleQuery)) ||
        (movie.name && movie.name.toLowerCase().includes(titleQuery))
    );
  }

  if (req.query.studio) {
    const studioQuery = req.query.studio.toLowerCase();
    filteredMovies = filteredMovies.filter(movie => {
      const studioName = movie.studio?.toLowerCase() || '';
      const studioId = movie.studioId?.toString().toLowerCase() || '';
      return studioName.includes(studioQuery) || studioId === studioQuery;
    });
  }

  if (req.query.minPrice || req.query.maxPrice) {
    const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : 0;
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : Infinity;

    filteredMovies = filteredMovies.filter(movie => {
      const price = movie.price || 0;
      return price >= minPrice && price <= maxPrice;
    });
  }

}));

app.get('/genres', asyncHandler(async (req, res) => {
  const filterData = getCachedData('filterData');

  res.json({
    success: true,
    data: filterData.genres,
    count: filterData.genres.length
  });
}));

app.get('/filter-data', asyncHandler(async (req, res) => {
  const filterData = getCachedData('filterData');

  res.json({
    success: true,
    data: filterData
  });
}));

app.get('/movieAge', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: movieAge
  });
}));

app.post('/transfer', asyncHandler(async (req, res) => {
  const { movieId, fromStudio, toStudio } = req.body;

  if (!movieId || !fromStudio || !toStudio) {
    return res.status(400).json({
      success: false,
      error: 'movieId, fromStudio, and toStudio are required.',
      received: req.body
    });
  }

  if (fromStudio === toStudio) {
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
    return res.status(400).json({
      success: false,
      error: `Invalid source studio '${fromStudio}'. Available studios: Disney, Warner, Sony`
    });
  }

  if (!toStudioObj) {
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
    res.status(400).json({
      success: false,
      error: result.error
    });
  }
}));

app.get('/stats', asyncHandler(async (req, res) => {
  const stats = getMovieStats([disney, warner, sony]);

  res.json({
    success: true,
    data: stats
  });
}));

app.get('/movies/:id', asyncHandler(async (req, res) => {
  const movieId = req.params.id;
  const movies = getCachedData('movies');

  const foundMovie = movies.find(movie => movie.id === movieId);

  if (!foundMovie) {
    return res.status(404).json({
      success: false,
      error: `Movie with ID ${movieId} not found`
    });
  }

  res.json({
    success: true,
    data: foundMovie
  });
}));

app.get('/health', (req, res) => {
  const filterData = getCachedData('filterData');

  res.json({
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
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Ruta ${req.originalUrl} no encontrada`,
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

const gracefulShutdown = () => {
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown());
process.on('SIGINT', () => gracefulShutdown());

app.listen(PORT, () => {
  refreshCache();
});
