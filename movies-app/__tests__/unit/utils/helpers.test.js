const {
    createSuccessState,
    createErrorState,
    createStudiosMap,
    generateMovieKey,
    getMovieId,
    mapStudioIdToBackendKey
} = require('@/utils/helpers')

describe('Utils - Helpers', () => {
    describe('createSuccessState', () => {
        it('should create success state with valid arrays', () => {
            const studios = [{ id: 1, name: 'Disney' }]
            const movies = [{ id: '1', name: 'Movie 1' }]

            const result = createSuccessState(studios, movies)

            expect(result).toEqual({
                studios,
                movies,
                loading: false,
                error: null
            })
        })

        it('should handle null/undefined inputs', () => {
            const result = createSuccessState(null, undefined)

            expect(result).toEqual({
                studios: [],
                movies: [],
                loading: false,
                error: null
            })
        })
    })

    describe('createErrorState', () => {
        it('should create error state with message', () => {
            const error = new Error('Test error')

            const result = createErrorState(error)

            expect(result).toEqual({
                studios: [],
                movies: [],
                loading: false,
                error: 'Test error'
            })
        })
    })

    describe('createStudiosMap', () => {
        it('should map studios by id', () => {
            const studios = [
                { id: 1, name: 'Disney' },
                { id: 2, name: 'Warner' }
            ]

            const result = createStudiosMap(studios)

            expect(result).toEqual({
                1: 'Disney',
                2: 'Warner'
            })
        })

        it('should handle empty array', () => {
            const result = createStudiosMap([])
            expect(result).toEqual({})
        })
    })

    describe('generateMovieKey', () => {
        it('should use id when available', () => {
            const movie = { id: '123', name: 'Test Movie' }
            expect(generateMovieKey(movie)).toBe('123')
        })

        it('should generate key from name and position when no id', () => {
            const movie = { name: 'Test Movie', position: '1' }
            expect(generateMovieKey(movie)).toBe('movie-Test Movie-1')
        })
    })

    describe('getMovieId', () => {
        it('should return id when available', () => {
            const movie = { id: '123', name: 'Test Movie' }
            expect(getMovieId(movie)).toBe('123')
        })

        it('should return name when no id', () => {
            const movie = { name: 'Test Movie' }
            expect(getMovieId(movie)).toBe('Test Movie')
        })

        it('should handle null movie', () => {
            expect(getMovieId(null)).toBeUndefined()
        })
    })

    describe('mapStudioIdToBackendKey', () => {
        it('should map known studio IDs', () => {
            expect(mapStudioIdToBackendKey('1')).toBe('disney')
            expect(mapStudioIdToBackendKey('2')).toBe('warner')
            expect(mapStudioIdToBackendKey('3')).toBe('sony')
            expect(mapStudioIdToBackendKey(1)).toBe('disney')
        })

        it('should return null for unknown IDs', () => {
            expect(mapStudioIdToBackendKey('4')).toBeNull()
            expect(mapStudioIdToBackendKey('unknown')).toBeNull()
        })
    })
})
