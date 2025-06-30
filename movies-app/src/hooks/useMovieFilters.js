import {useCallback, useMemo, useState} from 'react'

const INITIAL_FILTERS = {
    priceRange: { min: 0, max: 1000 },
    title: '',
    studio: ''
}
export const useMovieFilters = (movies = [], useBackendFiltering = false) => {
    const [filters, setFilters] = useState(INITIAL_FILTERS)
    const [backendResults, setBackendResults] = useState([])
    const [isSearching, setIsSearching] = useState(false)
    const filterOptions = useMemo(() => {
        if (!Array.isArray(movies) || movies.length === 0) {
            return {
                studios: [],
                priceRange: { min: 0, max: 1000 }
            }
        }

        try {
            const studios = [...new Set(
                movies
                    .map(movie => movie?.studio)
                    .filter(studio => studio && typeof studio === 'string')
            )].sort()

            const validPrices = movies
                .map(movie => movie?.price)
                .filter(price => typeof price === 'number' && price > 0 && !isNaN(price))

            let priceRange = { min: 0, max: 1000 }

            if (validPrices.length > 0) {
                const minPrice = Math.min(...validPrices)
                const maxPrice = Math.max(...validPrices)

                if (minPrice < maxPrice) {
                    priceRange = {
                        min: Math.floor(minPrice),
                        max: Math.ceil(maxPrice)
                    }
                }
            }
            return { studios, priceRange }
        } catch (error) {
            return {
                studios: [],
                priceRange: { min: 0, max: 1000 }
            }
        }
    }, [movies])

    const frontendFilteredMovies = useMemo(() => {
        if (useBackendFiltering) return backendResults
        if (!Array.isArray(movies) || movies.length === 0) return []

        try {
            return movies.filter(movie => {
                if (!movie || typeof movie !== 'object') return false

                if (filters.title?.trim()) {
                    const title = movie.title || movie.name || ''
                    if (!title.toLowerCase().includes(filters.title.toLowerCase())) {
                        return false
                    }
                }

                if (filters.studio && movie.studio !== filters.studio) {
                    return false
                }

                if (filters.priceRange) {
                    const moviePrice = Number(movie.price) || 0
                    const minPrice = Number(filters.priceRange.min) || 0
                    const maxPrice = Number(filters.priceRange.max) || 1000

                    if (moviePrice < minPrice || moviePrice > maxPrice) {
                        return false
                    }
                }

                return true
            })
        } catch (error) {
            return movies
        }
    }, [movies, filters, useBackendFiltering, backendResults])
    const updateFilter = useCallback((key, value) => {
        if (typeof key !== 'string') return

        setFilters(prev => {
            return {...prev, [key]: value}
        })
    }, [])

    const updatePriceRange = useCallback((min, max) => {
        const safeMin = Math.max(0, Number(min) || 0)
        const safeMax = Math.max(safeMin, Number(max) || 1000)

        setFilters(prev => ({
            ...prev,
            priceRange: { min: safeMin, max: safeMax }
        }))
    }, [])

    const resetFilters = useCallback(() => {
        setFilters(INITIAL_FILTERS)
        if (useBackendFiltering) {
            setBackendResults([])
        }
    }, [useBackendFiltering])

    const hasActiveFilters = useMemo(() => {
        if (!filters) return false

        return !!(
            filters.title?.trim() ||
            filters.studio ||
            (filters.priceRange?.min !== INITIAL_FILTERS.priceRange.min) ||
            (filters.priceRange?.max !== INITIAL_FILTERS.priceRange.max)
        )
    }, [filters])
    const setBackendFilteredResults = useCallback((results) => {
        setBackendResults(Array.isArray(results) ? results : [])
        setIsSearching(false)
    }, [])

    const setSearching = useCallback((searching) => {
        setIsSearching(searching)
    }, [])

    return {
        filters,
        filteredMovies: frontendFilteredMovies,
        filterOptions,
        updateFilter,
        updatePriceRange,
        resetFilters,
        hasActiveFilters,
        totalResults: frontendFilteredMovies.length,
        totalMovies: movies.length,
        isSearching,
        setBackendFilteredResults,
        setSearching
    }
}
