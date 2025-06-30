import { rest } from 'msw'
import {
    mockStudios,
    mockMovies,
    mockFilterData,
    mockStats,
    mockTransferSuccess,
    filterMovies,
    findStudioByName,
    GENRE_ID,
    GENRE_STRING
} from './mockData'

// Base URL - ajusta según tu configuración
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api'

export const handlers = [
    // GET /studios
    rest.get(`${API_BASE_URL}/studios`, (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json(mockStudios)
        )
    }),

    // GET /movies
    rest.get(`${API_BASE_URL}/movies`, (req, res, ctx) => {
        const title = req.url.searchParams.get('title')
        const studio = req.url.searchParams.get('studio')
        const minPrice = req.url.searchParams.get('minPrice')
        const maxPrice = req.url.searchParams.get('maxPrice')
        const genre = req.url.searchParams.get('genre')

        let filteredMovies = [...mockMovies]

        // Filtrar por título (busca en el campo 'name')
        if (title) {
            filteredMovies = filteredMovies.filter(movie =>
                movie.name.toLowerCase().includes(title.toLowerCase())
            )
        }

        // Filtrar por estudio
        if (studio) {
            const targetStudio = findStudioByName(studio)
            if (targetStudio) {
                filteredMovies = filteredMovies.filter(movie =>
                    targetStudio.movies.some(studioMovie => studioMovie.id === movie.id)
                )
            }
        }

        // Filtrar por género
        if (genre) {
            const genreId = parseInt(genre)
            filteredMovies = filteredMovies.filter(movie =>
                movie.genre === genreId
            )
        }

        // Filtrar por precio mínimo
        if (minPrice) {
            filteredMovies = filteredMovies.filter(movie =>
                movie.price >= parseInt(minPrice)
            )
        }

        // Filtrar por precio máximo
        if (maxPrice) {
            filteredMovies = filteredMovies.filter(movie =>
                movie.price <= parseInt(maxPrice)
            )
        }

        return res(
            ctx.status(200),
            ctx.json(filteredMovies)
        )
    }),

    // GET /filter-data
    rest.get(`${API_BASE_URL}/filter-data`, (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json(mockFilterData)
        )
    }),

    // GET /stats
    rest.get(`${API_BASE_URL}/stats`, (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json(mockStats)
        )
    }),

    // POST /transfer
    rest.post(`${API_BASE_URL}/transfer`, async (req, res, ctx) => {
        const { movieId, fromStudio, toStudio } = await req.json()

        // Validaciones básicas
        if (!movieId || !fromStudio || !toStudio) {
            return res(
                ctx.status(400),
                ctx.json({
                    error: 'Missing required parameters',
                    message: 'movieId, fromStudio, and toStudio are required'
                })
            )
        }

        // Verificar que la película existe
        const movie = mockMovies.find(m => m.id === movieId)
        if (!movie) {
            return res(
                ctx.status(404),
                ctx.json({
                    error: 'Movie not found',
                    message: `Movie with id ${movieId} does not exist`
                })
            )
        }

        // Verificar que los estudios existen
        const sourceStudio = findStudioByName(fromStudio)
        const targetStudio = findStudioByName(toStudio)

        if (!sourceStudio) {
            return res(
                ctx.status(404),
                ctx.json({
                    error: 'Source studio not found',
                    message: `Studio '${fromStudio}' does not exist`
                })
            )
        }

        if (!targetStudio) {
            return res(
                ctx.status(404),
                ctx.json({
                    error: 'Target studio not found',
                    message: `Studio '${toStudio}' does not exist`
                })
            )
        }

        // Verificar que la película pertenece al estudio de origen
        const movieInStudio = sourceStudio.movies.find(m => m.id === movieId)
        if (!movieInStudio) {
            return res(
                ctx.status(400),
                ctx.json({
                    error: 'Movie not in source studio',
                    message: `Movie '${movie.name}' does not belong to ${sourceStudio.name}`
                })
            )
        }

        // Simular transferencia exitosa
        return res(
            ctx.status(200),
            ctx.json({
                ...mockTransferSuccess,
                data: {
                    ...mockTransferSuccess.data,
                    movieId,
                    movieName: movie.name,
                    fromStudio: sourceStudio.name.toLowerCase(),
                    toStudio: targetStudio.name.toLowerCase(),
                    transferDate: new Date().toISOString()
                }
            })
        )
    }),

    // GET /movies/:id - obtener película específica
    rest.get(`${API_BASE_URL}/movies/:id`, (req, res, ctx) => {
        const { id } = req.params
        const movie = mockMovies.find(m => m.id === id)

        if (!movie) {
            return res(
                ctx.status(404),
                ctx.json({ message: `Movie with id ${id} not found` })
            )
        }

        return res(
            ctx.status(200),
            ctx.json(movie)
        )
    }),

    // GET /studios/:id - obtener estudio específico
    rest.get(`${API_BASE_URL}/studios/:id`, (req, res, ctx) => {
        const { id } = req.params
        const studio = mockStudios.find(s => s.id === id)

        if (!studio) {
            return res(
                ctx.status(404),
                ctx.json({ message: `Studio with id ${id} not found` })
            )
        }

        return res(
            ctx.status(200),
            ctx.json(studio)
        )
    }),

    // GET /genres - obtener géneros disponibles
    rest.get(`${API_BASE_URL}/genres`, (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                genreIds: GENRE_ID,
                genreStrings: GENRE_STRING,
                genres: Object.values(GENRE_STRING)
            })
        )
    }),

    // Handlers para errores específicos (útiles para testing)

    // Error en studios
    rest.get(`${API_BASE_URL}/studios/error`, (req, res, ctx) => {
        return res(
            ctx.status(500),
            ctx.json({ message: 'Internal server error' })
        )
    }),

    // Error en movies
    rest.get(`${API_BASE_URL}/movies/error`, (req, res, ctx) => {
        return res(
            ctx.status(404),
            ctx.json({ message: 'Movies not found' })
        )
    }),

    // Error en filter-data (para testing del fallback)
    rest.get(`${API_BASE_URL}/filter-data/error`, (req, res, ctx) => {
        return res(
            ctx.status(503),
            ctx.json({ message: 'Service unavailable' })
        )
    }),

    // Error en transferencia - estudio de origen sin suficiente dinero
    rest.post(`${API_BASE_URL}/transfer/insufficient-funds`, async (req, res, ctx) => {
        return res(
            ctx.status(400),
            ctx.json({
                error: 'Insufficient funds',
                message: 'Source studio does not have enough money for the transfer'
            })
        )
    })
]

// Handlers específicos para testing de errores
export const errorHandlers = [
    rest.get(`${API_BASE_URL}/studios`, (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ message: 'Server error' }))
    }),
    rest.get(`${API_BASE_URL}/movies`, (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ message: 'Server error' }))
    }),
    rest.get(`${API_BASE_URL}/filter-data`, (req, res, ctx) => {
        return res(ctx.status(503), ctx.json({ message: 'Service unavailable' }))
    }),
    rest.post(`${API_BASE_URL}/transfer`, (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ message: 'Transfer failed' }))
    })
]

// Handlers para casos específicos de testing
export const customHandlers = {
    // Para probar películas con precios extremos
    expensiveMoviesHandler: rest.get(`${API_BASE_URL}/movies/expensive`, (req, res, ctx) => {
        const expensiveMovies = mockMovies.filter(movie => movie.price >= 1000000000)
        return res(ctx.status(200), ctx.json(expensiveMovies))
    }),

    // Para probar datos inconsistentes
    inconsistentDataHandler: rest.get(`${API_BASE_URL}/filter-data/inconsistent`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({
            studios: mockStudios,
            movies: null, // Datos inconsistentes
            genres: undefined
        }))
    }),

    // Para probar timeout
    timeoutHandler: rest.get(`${API_BASE_URL}/movies/timeout`, (req, res, ctx) => {
        return res(ctx.delay(30000)) // Delay de 30 segundos
    })
}
