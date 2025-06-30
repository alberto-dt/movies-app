import { movieApi } from '@services/movieApi'
import { apiClient } from '@services/api'
import { ENDPOINTS } from '@services/endpoints'

jest.mock('@services/api', () => ({
    apiClient: {
        get: jest.fn(),
        post: jest.fn()
    }
}))

describe('movieApi', () => {
    const originalConsoleLog = console.log
    const originalConsoleWarn = console.warn

    beforeEach(() => {
        jest.clearAllMocks()

        console.log = jest.fn()
        console.warn = jest.fn()
    })

    afterAll(() => {
        console.log = originalConsoleLog
        console.warn = originalConsoleWarn
    })

    describe('getStudios', () => {
        it('should fetch studios successfully', async () => {
            const mockStudios = [
                {
                    id: '1',
                    name: 'Disney studios',
                    shortName: 'Disney',
                    money: 1000,
                    movies: []
                },
                {
                    id: '2',
                    name: 'Warner Bros.',
                    shortName: 'Warner',
                    money: 900,
                    movies: []
                }
            ]

            apiClient.get.mockResolvedValue({ data: mockStudios })

            const result = await movieApi.getStudios()

            expect(apiClient.get).toHaveBeenCalledWith(ENDPOINTS.STUDIOS)
            expect(result).toEqual(mockStudios)
        })

        it('should handle API errors', async () => {
            const error = new Error('Network error')
            apiClient.get.mockRejectedValue(error)

            await expect(movieApi.getStudios()).rejects.toThrow('Network error')
            expect(apiClient.get).toHaveBeenCalledWith(ENDPOINTS.STUDIOS)
        })
    })

    describe('getMovies', () => {
        it('should fetch movies without parameters', async () => {
            const mockMovies = [
                {
                    id: '11',
                    name: 'Nightmare before christmas',
                    genre: 6,
                    price: 600,
                },
                {
                    id: '21',
                    name: 'The conjuring',
                    genre: 6,
                    price: 1000000000,
                }
            ]

            apiClient.get.mockResolvedValue({ data: mockMovies })

            const result = await movieApi.getMovies()

            expect(apiClient.get).toHaveBeenCalledWith(ENDPOINTS.MOVIES, { params: {} })
            expect(result).toEqual(mockMovies)
        })

        it('should fetch movies with parameters', async () => {
            const mockMovies = [
                {
                    id: '11',
                    name: 'Nightmare before christmas',
                    genre: 6,
                    price: 600
                }
            ]
            const params = { studio: 'Disney', title: 'Nightmare' }

            apiClient.get.mockResolvedValue({ data: mockMovies })

            const result = await movieApi.getMovies(params)

            expect(apiClient.get).toHaveBeenCalledWith(ENDPOINTS.MOVIES, { params })
            expect(result).toEqual(mockMovies)
        })
    })

    describe('getFilterData', () => {
        it('should fetch filter data from dedicated endpoint successfully', async () => {
            const mockFilterData = {
                studios: [
                    { id: '1', name: 'Disney studios', shortName: 'Disney' }
                ],
                movies: [
                    { id: '11', name: 'Nightmare before christmas', genre: 6, price: 600 }
                ],
                genres: ['HOR', 'ANI', 'HER', 'ADV']
            }

            apiClient.get.mockResolvedValue({ data: mockFilterData })

            const result = await movieApi.getFilterData()

            expect(apiClient.get).toHaveBeenCalledWith(ENDPOINTS.FILTER_DATA)
            expect(result).toEqual(mockFilterData)
            expect(console.log).toHaveBeenCalledWith('🎯 Backend filter data received:', {
                studiosCount: 1,
                moviesCount: 1,
                genresCount: 4,
                sampleMovie: { id: '11', name: 'Nightmare before christmas', genre: 6, price: 600 },
                genres: ['HOR', 'ANI', 'HER', 'ADV']
            })
        })

        it('should fallback to separate calls when filter endpoint fails', async () => {
            const mockStudios = [
                { id: '1', name: 'Disney studios', shortName: 'Disney' }
            ]
            const mockMovies = [
                { id: '11', name: 'Nightmare before christmas', genre: 6, price: 600 }
            ]

            apiClient.get
                .mockRejectedValueOnce(new Error('Endpoint not available'))
                .mockResolvedValueOnce({ data: mockStudios })
                .mockResolvedValueOnce({ data: mockMovies })

            const result = await movieApi.getFilterData()

            expect(console.warn).toHaveBeenCalledWith('Filter data endpoint not available, fetching separately')
            expect(result).toEqual({
                studios: mockStudios,
                movies: mockMovies,
                genres: []
            })
        })

        it('should handle partial failures in fallback mode', async () => {
            const mockStudios = [
                { id: '1', name: 'Disney studios' }
            ]

            apiClient.get
                .mockRejectedValueOnce(new Error('Endpoint not available'))
                .mockResolvedValueOnce({ data: mockStudios })
                .mockRejectedValueOnce(new Error('Movies endpoint failed'))

            const result = await movieApi.getFilterData()

            expect(result).toEqual({
                studios: mockStudios,
                movies: [],
                genres: []
            })
        })
    })

    describe('getAllData', () => {
        it('should return properly formatted data', async () => {
            const mockFilterData = {
                studios: [{ id: '1', name: 'Disney studios' }],
                movies: [{ id: '11', name: 'Nightmare before christmas' }],
                genres: ['HOR', 'ANI']
            }

            apiClient.get.mockResolvedValue({ data: mockFilterData })

            const result = await movieApi.getAllData()

            expect(result).toEqual({
                studios: mockFilterData.studios,
                movies: mockFilterData.movies,
                genres: mockFilterData.genres
            })
        })

        it('should handle non-array data gracefully', async () => {
            const mockFilterData = {
                studios: null,
                movies: undefined,
                genres: 'not an array'
            }

            apiClient.get.mockResolvedValue({ data: mockFilterData })

            const result = await movieApi.getAllData()

            expect(result).toEqual({
                studios: [],
                movies: [],
                genres: []
            })
        })

        it('should propagate errors from getFilterData when all methods fail', async () => {
            apiClient.get
                .mockRejectedValueOnce(new Error('Filter endpoint failed'))
                .mockRejectedValueOnce(new Error('Studios endpoint failed'))
                .mockRejectedValueOnce(new Error('Movies endpoint failed'))

            const result = await movieApi.getAllData()

            expect(result).toEqual({
                studios: [],
                movies: [],
                genres: []
            })
        })
    })

    describe('getStats', () => {
        it('should fetch stats successfully', async () => {
            const mockStats = {
                totalMovies: 12,
                totalStudios: 3,
                totalMoney: 2600,
                averagePrice: 2167167167.25,
                moviesByStudio: {
                    'Disney studios': 4,
                    'Warner Bros.': 4,
                    'Sony Pictures': 4
                }
            }

            apiClient.get.mockResolvedValue({ data: mockStats })

            const result = await movieApi.getStats()

            expect(apiClient.get).toHaveBeenCalledWith(ENDPOINTS.STATS)
            expect(result).toEqual(mockStats)
        })
    })

    describe('transferMovie', () => {
        it('should transfer movie successfully', async () => {
            const mockResponse = {
                success: true,
                message: 'Movie transferred',
                data: {
                    movieId: '11',
                    fromStudio: 'disney studios',
                    toStudio: 'warner bros.'
                }
            }
            const movieId = '11'
            const fromStudio = 'Disney studios'
            const toStudio = 'Warner Bros.'

            apiClient.post.mockResolvedValue({ data: mockResponse })

            const result = await movieApi.transferMovie(movieId, fromStudio, toStudio)

            expect(apiClient.post).toHaveBeenCalledWith(ENDPOINTS.TRANSFER, {
                movieId: '11',
                fromStudio: 'disney studios',
                toStudio: 'warner bros.'
            })
            expect(result).toEqual(mockResponse)
        })

        it('should throw error for missing movieId', async () => {
            await expect(movieApi.transferMovie(null, 'Disney studios', 'Warner Bros.'))
                .rejects.toThrow('Missing required parameters for movie transfer')

            expect(apiClient.post).not.toHaveBeenCalled()
        })

        it('should throw error for missing fromStudio', async () => {
            await expect(movieApi.transferMovie('11', null, 'Warner Bros.'))
                .rejects.toThrow('Missing required parameters for movie transfer')

            expect(apiClient.post).not.toHaveBeenCalled()
        })

        it('should throw error for missing toStudio', async () => {
            await expect(movieApi.transferMovie('11', 'Disney studios', null))
                .rejects.toThrow('Missing required parameters for movie transfer')

            expect(apiClient.post).not.toHaveBeenCalled()
        })

        it('should convert studio names to lowercase', async () => {
            const mockResponse = { success: true }
            apiClient.post.mockResolvedValue({ data: mockResponse })

            await movieApi.transferMovie('11', 'DISNEY STUDIOS', 'WARNER BROS.')

            expect(apiClient.post).toHaveBeenCalledWith(ENDPOINTS.TRANSFER, {
                movieId: '11',
                fromStudio: 'disney studios',
                toStudio: 'warner bros.'
            })
        })
    })

    describe('searchMoviesWithFilters', () => {
        it('should search movies without filters', async () => {
            const mockMovies = [
                { id: '11', name: 'Nightmare before christmas', genre: 6, price: 600 }
            ]
            apiClient.get.mockResolvedValue({ data: mockMovies })

            const result = await movieApi.searchMoviesWithFilters()

            expect(apiClient.get).toHaveBeenCalledWith(ENDPOINTS.MOVIES, { params: {} })
            expect(result).toEqual(mockMovies)
        })

        it('should search movies with title filter', async () => {
            const mockMovies = [
                { id: '13', name: 'The avengers', genre: 1, price: 300 }
            ]
            const filters = { title: '  avengers  ' }

            apiClient.get.mockResolvedValue({ data: mockMovies })

            const result = await movieApi.searchMoviesWithFilters(filters)

            expect(apiClient.get).toHaveBeenCalledWith(ENDPOINTS.MOVIES, {
                params: { title: 'avengers' }
            })
            expect(result).toEqual(mockMovies)
        })

        it('should ignore empty title filter', async () => {
            const mockMovies = []
            const filters = { title: '   ' }

            apiClient.get.mockResolvedValue({ data: mockMovies })

            await movieApi.searchMoviesWithFilters(filters)

            expect(apiClient.get).toHaveBeenCalledWith(ENDPOINTS.MOVIES, { params: {} })
        })

        it('should search movies with studio filter', async () => {
            const mockMovies = [
                { id: '11', name: 'Nightmare before christmas', genre: 6, price: 600 }
            ]
            const filters = { studio: 'Disney studios' }

            apiClient.get.mockResolvedValue({ data: mockMovies })

            const result = await movieApi.searchMoviesWithFilters(filters)

            expect(apiClient.get).toHaveBeenCalledWith(ENDPOINTS.MOVIES, {
                params: { studio: 'Disney studios' }
            })
            expect(result).toEqual(mockMovies)
        })

        it('should search movies with price range filter', async () => {
            const mockMovies = [
                { id: '11', name: 'Nightmare before christmas', genre: 6, price: 600 }
            ]
            const filters = {
                priceRange: { min: 500, max: 800 }
            }

            apiClient.get.mockResolvedValue({ data: mockMovies })

            const result = await movieApi.searchMoviesWithFilters(filters)

            expect(apiClient.get).toHaveBeenCalledWith(ENDPOINTS.MOVIES, {
                params: { minPrice: 500, maxPrice: 800 }
            })
            expect(result).toEqual(mockMovies)
        })

        it('should ignore default price range values', async () => {
            const mockMovies = []
            const filters = {
                priceRange: { min: 0, max: 1000 }
            }

            apiClient.get.mockResolvedValue({ data: mockMovies })

            await movieApi.searchMoviesWithFilters(filters)

            expect(apiClient.get).toHaveBeenCalledWith(ENDPOINTS.MOVIES, { params: {} })
        })

        it('should handle price range with only min value above 0', async () => {
            const mockMovies = []
            const filters = {
                priceRange: { min: 500, max: 1000 }
            }

            apiClient.get.mockResolvedValue({ data: mockMovies })

            await movieApi.searchMoviesWithFilters(filters)

            expect(apiClient.get).toHaveBeenCalledWith(ENDPOINTS.MOVIES, {
                params: { minPrice: 500 }
            })
        })

        it('should handle price range with only max value below 1000', async () => {
            const mockMovies = []
            const filters = {
                priceRange: { min: 0, max: 800 }
            }

            apiClient.get.mockResolvedValue({ data: mockMovies })

            await movieApi.searchMoviesWithFilters(filters)

            expect(apiClient.get).toHaveBeenCalledWith(ENDPOINTS.MOVIES, {
                params: { maxPrice: 800 }
            })
        })

        it('should search movies with all filters combined', async () => {
            const mockMovies = [
                { id: '11', name: 'Nightmare before christmas', genre: 6, price: 600 }
            ]
            const filters = {
                title: 'nightmare',
                studio: 'Disney studios',
                priceRange: { min: 500, max: 700 }
            }

            apiClient.get.mockResolvedValue({ data: mockMovies })

            const result = await movieApi.searchMoviesWithFilters(filters)

            expect(apiClient.get).toHaveBeenCalledWith(ENDPOINTS.MOVIES, {
                params: {
                    title: 'nightmare',
                    studio: 'Disney studios',
                    minPrice: 500,
                    maxPrice: 700
                }
            })
            expect(result).toEqual(mockMovies)
        })

        it('should return empty array on API error', async () => {
            const filters = { title: 'test' }
            apiClient.get.mockRejectedValue(new Error('API Error'))

            const result = await movieApi.searchMoviesWithFilters(filters)

            expect(result).toEqual([])
        })

        it('should handle edge cases with extreme prices', async () => {
            const mockMovies = [
                { id: '12', name: 'Aladdin', genre: 4, price: 10000000000 },
                { id: '34', name: 'Last action hero', genre: 9, price: 10000000000000 }
            ]
            const filters = {
                priceRange: { min: 1000000000, max: 50000000000000 }
            }

            apiClient.get.mockResolvedValue({ data: mockMovies })

            const result = await movieApi.searchMoviesWithFilters(filters)

            expect(apiClient.get).toHaveBeenCalledWith(ENDPOINTS.MOVIES, {
                params: { minPrice: 1000000000 }
            })
            expect(result).toEqual(mockMovies)
        })
    })
})
