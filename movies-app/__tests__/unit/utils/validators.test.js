import {
    validateMovie,
    validateStudios,
    validateTransferData
} from '@/utils/validators'
import { VALIDATION_MESSAGES } from '@/constants'

describe('Utils - Validators', () => {
    describe('validateMovie', () => {
        it('should return null for valid movie', () => {
            const movie = { id: '123', name: 'Test Movie' }
            expect(validateMovie(movie)).toBeNull()
        })

        it('should return error for null movie', () => {
            expect(validateMovie(null)).toBe(VALIDATION_MESSAGES.NO_MOVIE)
        })

        it('should return error for movie without id or name', () => {
            const movie = { title: 'Test' }
            expect(validateMovie(movie)).toBe(VALIDATION_MESSAGES.NO_MOVIE_ID)
        })
    })

    describe('validateStudios', () => {
        it('should return null for valid studios', () => {
            expect(validateStudios('disney', 'warner')).toBeNull()
        })

        it('should return error for missing studios', () => {
            expect(validateStudios('', 'warner')).toBe(VALIDATION_MESSAGES.MISSING_STUDIOS)
            expect(validateStudios('disney', '')).toBe(VALIDATION_MESSAGES.MISSING_STUDIOS)
        })

        it('should return error for same studios', () => {
            expect(validateStudios('disney', 'disney')).toBe(VALIDATION_MESSAGES.SAME_STUDIO)
        })
    })

    describe('validateTransferData', () => {
        it('should return null for valid data', () => {
            const movie = { id: '123' }
            expect(validateTransferData(movie, 'disney', 'warner')).toBeNull()
        })

        it('should return movie validation error first', () => {
            expect(validateTransferData(null, 'disney', 'warner')).toBe(VALIDATION_MESSAGES.NO_MOVIE)
        })

        it('should return studio validation error', () => {
            const movie = { id: '123' }
            expect(validateTransferData(movie, 'disney', 'disney')).toBe(VALIDATION_MESSAGES.SAME_STUDIO)
        })
    })
})
