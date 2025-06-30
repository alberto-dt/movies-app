import { rest } from 'msw'
import {
    mockStudios,
    mockMovies,
    mockFilterData,
    mockStats,
    mockTransferSuccess,
    findStudioByName,
    GENRE_ID,
    GENRE_STRING
} from './mockData'

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api'

export const handlers = [
    rest.get(`${API_BASE_URL}/studios`, (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json(mockStudios)
        )
    }),

    rest.get(`${API_BASE_URL}/movies`, (req, res, ctx) => {
        const title = req.url.searchParams.get('title')
        const studio = req.url.searchParams.get('studio')
        const minPrice = req.url.searchParams.get('minPrice')
        const maxPrice = req.url.searchParams.get('maxPrice')
        req.url.searchParams.get('genre');
        let filteredMovies = [...mockMovies]

        if (title) {
            filteredMovies = filteredMovies.filter(movie =>
                movie.name.toLowerCase().includes(title.toLowerCase())
            )
        }

        if (studio) {
            const targetStudio = findStudioByName(studio)
            if (targetStudio) {
                filteredMovies = filteredMovies.filter(movie =>
                    targetStudio.movies.some(studioMovie => studioMovie.id === movie.id)
                )
            }
        }


        if (minPrice) {
            filteredMovies = filteredMovies.filter(movie =>
                movie.price >= parseInt(minPrice)
            )
        }

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

    rest.get(`${API_BASE_URL}/filter-data`, (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json(mockFilterData)
        )
    }),

    rest.get(`${API_BASE_URL}/stats`, (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json(mockStats)
        )
    }),

    rest.post(`${API_BASE_URL}/transfer`, async (req, res, ctx) => {
        const { movieId, fromStudio, toStudio } = await req.json()

        if (!movieId || !fromStudio || !toStudio) {
            return res(
                ctx.status(400),
                ctx.json({
                    error: 'Missing required parameters',
                    message: 'movieId, fromStudio, and toStudio are required'
                })
            )
        }

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


    rest.get(`${API_BASE_URL}/studios/error`, (req, res, ctx) => {
        return res(
            ctx.status(500),
            ctx.json({ message: 'Internal server error' })
        )
    }),

    rest.get(`${API_BASE_URL}/movies/error`, (req, res, ctx) => {
        return res(
            ctx.status(404),
            ctx.json({ message: 'Movies not found' })
        )
    }),

    rest.get(`${API_BASE_URL}/filter-data/error`, (req, res, ctx) => {
        return res(
            ctx.status(503),
            ctx.json({ message: 'Service unavailable' })
        )
    }),

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
rest.get(`${API_BASE_URL}/studios`, (req, res, ctx) => {
    return res(ctx.status(500), ctx.json({ message: 'Server error' }))
});
rest.get(`${API_BASE_URL}/movies`, (req, res, ctx) => {
    return res(ctx.status(500), ctx.json({ message: 'Server error' }))
});
rest.get(`${API_BASE_URL}/filter-data`, (req, res, ctx) => {
    return res(ctx.status(503), ctx.json({ message: 'Service unavailable' }))
});
rest.post(`${API_BASE_URL}/transfer`, (req, res, ctx) => {
    return res(ctx.status(500), ctx.json({ message: 'Transfer failed' }))
});

rest.get(`${API_BASE_URL}/movies
/expensive`, (req, res, ctx) => {
    const expensiveMovies = mockMovies.filter(movie => movie.price >= 1000000000)
    return res(ctx.status(200), ctx.json(expensiveMovies))
});
rest.get(`${API_BASE_URL}/filter-data/inconsistent`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({
        studios: mockStudios,
        movies: null,
        genres: undefined
    }))
});
rest.get(`${API_BASE_URL}/movies/timeout`, (req, res, ctx) => {
    return res(ctx.delay(30000))
});
