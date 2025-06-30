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

// Log de inicio de aplicación
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
    logger.warn('Rate limit excedido', {
      ip: req.ip,
      url: req.url,
      userAgent: req.get('User-Agent')
    });
    res.status(429).json({
      success: false,
      error: 'Demasiadas solicitudes, intente más tarde.'
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

// Reemplazar el middleware básico con el middleware de logging
app.use(requestLoggingMiddleware);

let studiosCache = null;
let moviesCache = null;
let filterDataCache = null;
let cacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000;

const isCacheValid = () => {
  const isValid = cacheTime && (Date.now() - cacheTime) < CACHE_DURATION;
  logger.debug('Validación de cache', {
    esVálido: isValid,
    edadCache: Date.now() - cacheTime
  });
  return isValid;
};

const refreshCache = () => {
  const startTime = Date.now();

  try {
    logger.info('Refrescando cache de datos');

    studiosCache = [disney, warner, sony].map(studio => {
      const { movies, ...studioWithoutMovies } = studio;
      return studioWithoutMovies;
    });

    filterDataCache = getFilterData([disney, warner, sony]);
    moviesCache = filterDataCache.movies;
    cacheTime = Date.now();

    const duration = Date.now() - startTime;
    logger.logCache('refrescado', {
      duración: duration,
      películas: moviesCache.length,
      estudios: studiosCache.length,
      géneros: filterDataCache.genres.length
    });

    logger.info('Cache refrescado exitosamente', {
      películasTotal: moviesCache.length,
      estudiosTotal: studiosCache.length
    });

  } catch (error) {
    logger.error('Error al refrescar cache', error);
    throw error;
  }
};

const getCachedData = (type) => {
  if (!isCacheValid()) {
    logger.debug('Cache inválido, refrescando');
    refreshCache();
  } else {
    logger.logCache('hit', { tipo: type });
  }

  switch (type) {
    case 'studios':
      return studiosCache;
    case 'movies':
      return moviesCache;
    case 'filterData':
      return filterDataCache;
    default:
      logger.warn('Tipo de cache desconocido solicitado', { tipo: type });
      return null;
  }
};

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

app.get('/studios', asyncHandler(async (req, res) => {
  logger.debug('Solicitando lista de estudios');
  const studios = getCachedData('studios');

  res.json({
    success: true,
    data: studios,
    count: studios.length
  });
}));

app.get('/movies', asyncHandler(async (req, res) => {
  logger.debug('Solicitando lista de películas', {
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
    logger.debug('Filtro por título aplicado', {
      título: req.query.title,
      resultados: filteredMovies.length
    });
  }

  if (req.query.studio) {
    const studioQuery = req.query.studio.toLowerCase();
    filteredMovies = filteredMovies.filter(movie => {
      const studioName = movie.studio?.toLowerCase() || '';
      const studioId = movie.studioId?.toString().toLowerCase() || '';
      return studioName.includes(studioQuery) || studioId === studioQuery;
    });
    logger.debug('Filtro por estudio aplicado', {
      estudio: req.query.studio,
      resultados: filteredMovies.length
    });
  }

  if (req.query.minPrice || req.query.maxPrice) {
    const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : 0;
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : Infinity;

    filteredMovies = filteredMovies.filter(movie => {
      const price = movie.price || 0;
      return price >= minPrice && price <= maxPrice;
    });

    logger.debug('Filtro por precio aplicado', {
      precioMín: minPrice,
      precioMáx: maxPrice,
      resultados: filteredMovies.length
    });
  }

  logger.info('Consulta de películas completada', {
    totalOriginal: originalCount,
    totalFiltrado: filteredMovies.length,
    filtrosAplicados: Object.keys(req.query).length
  });

  res.json({
    success: true,
    data: filteredMovies,
    count: filteredMovies.length,
    filtered: filteredMovies.length !== originalCount
  });
}));

app.get('/genres', asyncHandler(async (req, res) => {
  logger.debug('Solicitando lista de géneros');
  const filterData = getCachedData('filterData');

  res.json({
    success: true,
    data: filterData.genres,
    count: filterData.genres.length
  });
}));

app.get('/filter-data', asyncHandler(async (req, res) => {
  logger.debug('Solicitando datos de filtros');
  const filterData = getCachedData('filterData');

  res.json({
    success: true,
    data: filterData
  });
}));

app.get('/movieAge', asyncHandler(async (req, res) => {
  logger.debug('Solicitando datos de edad de películas');
  res.json({
    success: true,
    data: movieAge
  });
}));

app.post('/transfer', asyncHandler(async (req, res) => {
  const { movieId, fromStudio, toStudio } = req.body;

  logger.info('Solicitud de transferencia recibida', {
    película: movieId,
    origen: fromStudio,
    destino: toStudio,
    ip: req.ip
  });

  if (!movieId || !fromStudio || !toStudio) {
    logger.warn('Transferencia rechazada: parámetros faltantes', {
      recibido: req.body
    });
    return res.status(400).json({
      success: false,
      error: 'movieId, fromStudio, and toStudio are required.',
      received: req.body
    });
  }

  if (fromStudio === toStudio) {
    logger.warn('Transferencia rechazada: mismo estudio', {
      película: movieId,
      estudio: fromStudio
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
    logger.error('Estudio origen inválido', {
      estudioSolicitado: fromStudio,
      estudiosDisponibles: Object.keys(studioMap)
    });
    return res.status(400).json({
      success: false,
      error: `Invalid source studio '${fromStudio}'. Available studios: Disney, Warner, Sony`
    });
  }

  if (!toStudioObj) {
    logger.error('Estudio destino inválido', {
      estudioSolicitado: toStudio,
      estudiosDisponibles: Object.keys(studioMap)
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
    // Invalidar cache
    studiosCache = null;
    moviesCache = null;
    filterDataCache = null;
    cacheTime = 0;

    logger.logCache('invalidado', { razón: 'transferencia exitosa' });

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
    logger.error('Transferencia fallida', null, {
      película: movieId,
      error: result.error
    });
    res.status(400).json({
      success: false,
      error: result.error
    });
  }
}));

app.get('/stats', asyncHandler(async (req, res) => {
  logger.debug('Solicitando estadísticas de películas');
  const stats = getMovieStats([disney, warner, sony]);

  res.json({
    success: true,
    data: stats
  });
}));

app.get('/movies/:id', asyncHandler(async (req, res) => {
  const movieId = req.params.id;
  logger.debug('Buscando película por ID', { películaId: movieId });

  const movies = getCachedData('movies');
  const foundMovie = movies.find(movie => movie.id === movieId);

  if (!foundMovie) {
    logger.warn('Película no encontrada', { películaId: movieId });
    return res.status(404).json({
      success: false,
      error: `Movie with ID ${movieId} not found`
    });
  }

  logger.info('Película encontrada', {
    películaId: movieId,
    nombre: foundMovie.name
  });

  res.json({
    success: true,
    data: foundMovie
  });
}));

app.get('/health', (req, res) => {
  logger.debug('Health check solicitado');
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

  logger.info('Health check completado', healthData.cache);
  res.json(healthData);
});

// Ruta 404
app.use((req, res) => {
  logger.warn('Ruta no encontrada', {
    url: req.originalUrl,
    método: req.method,
    ip: req.ip
  });

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

// Middleware de manejo de errores (debe ir al final)
app.use(errorLoggingMiddleware);

// Graceful shutdown
const gracefulShutdown = () => {
  logger.info('Cerrando servidor Movies App gracefully');
  process.exit(0);
};

process.on('SIGTERM', () => {
  logger.info('Señal SIGTERM recibida');
  gracefulShutdown();
});

process.on('SIGINT', () => {
  logger.info('Señal SIGINT recibida');
  gracefulShutdown();
});

// Manejar errores no capturados
process.on('uncaughtException', (error) => {
  logger.error('Excepción no capturada', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Promise rejection no manejada', new Error(reason), {
    promise: promise.toString()
  });
});

app.listen(PORT, () => {
  refreshCache();
  logger.info(`Servidor Movies App iniciado exitosamente en puerto ${PORT}`, {
    entorno: process.env.NODE_ENV || 'development',
    pid: process.pid
  });
});
