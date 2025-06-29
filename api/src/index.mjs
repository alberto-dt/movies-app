import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import {getAllMoviesFromStudios, getMovieStats, transferMovie} from './helpers.mjs'
import {disney, movieAge, sony, warner} from '../constants/studio_constants.mjs'

const app = express();

const PORT = process.env.PORT || 3001;

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
const getStudiosWithoutMovies = () => {
  if (!studiosCache) {
    studiosCache = [disney, warner, sony].map(studio => {
      const { movies, ...studioWithoutMovies } = studio;
      return studioWithoutMovies;
    });
  }
  return studiosCache;
};

let moviesCache = null;
let moviesCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000;

const getCachedMovies = () => {
  const now = Date.now();
  if (!moviesCache || (now - moviesCacheTime) > CACHE_DURATION) {
    try {
      moviesCache = getAllMoviesFromStudios([disney, warner, sony]);
      moviesCacheTime = now;
    } catch (error) {
      console.error('Error al obtener películas:', error);
      throw error;
    }
  }
  return moviesCache;
};

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

app.get('/studios', asyncHandler(async (req, res) => {
  const studios = getStudiosWithoutMovies();
  res.json({
    success: true,
    data: studios,
    count: studios.length
  });
}));

app.get('/movies', asyncHandler(async (req, res) => {
  let filteredMovies = getCachedMovies();

  if (req.query.studio) {
    filteredMovies = filteredMovies.filter(movie =>
        movie.studioId && movie.studioId.toString().toLowerCase() === req.query.studio.toLowerCase()
    );
  }

  if (req.query.genre) {
    filteredMovies = filteredMovies.filter(movie =>
        movie.genre && movie.genre.toLowerCase().includes(req.query.genre.toLowerCase())
    );
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || filteredMovies.length;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const paginatedMovies = filteredMovies.slice(startIndex, endIndex);

  res.json({
    success: true,
    data: paginatedMovies,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(filteredMovies.length / limit),
      totalItems: filteredMovies.length,
      itemsPerPage: limit
    },
    filters: {
      studio: req.query.studio || null,
      genre: req.query.genre || null
    }
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
    moviesCacheTime = 0;

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

  let foundMovie = null;
  let foundStudio = null;

  for (const studio of [disney, warner, sony]) {
    const movie = studio.movies?.find(movie => movie.id === movieId);
    if (movie) {
      foundMovie = movie;
      foundStudio = studio;
      break;
    }
  }

  if (!foundMovie) {
    return res.status(404).json({
      success: false,
      error: `Movie with ID ${movieId} not found`
    });
  }

  res.json({
    success: true,
    data: {
      ...foundMovie,
      studioId: foundStudio?.id,
      studioName: foundStudio?.name
    }
  });
}));

app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version
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

app.listen(PORT);
