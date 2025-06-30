import {apiClient} from './api'
import {ENDPOINTS} from './endpoints'

export const movieApi = {
    async getStudios() {
        const response = await apiClient.get(ENDPOINTS.STUDIOS)
        return response.data
    },

    async getMovies(params = {}) {
        const response = await apiClient.get(ENDPOINTS.MOVIES, { params })
        return response.data
    },

    async getFilterData() {
        try {
            const response = await apiClient.get(ENDPOINTS.FILTER_DATA)

            console.log('🎯 Backend filter data received:', {
                studiosCount: response.data?.studios?.length || 0,
                moviesCount: response.data?.movies?.length || 0,
                genresCount: response.data?.genres?.length || 0,
                sampleMovie: response.data?.movies?.[0],
                genres: response.data?.genres
            })

            return response.data
        } catch (error) {
            console.warn('Filter data endpoint not available, fetching separately')

            // ✅ CORREGIR: Solo hacer 2 llamadas ya que no tienes endpoint para genres
            const [studiosResponse, moviesResponse] = await Promise.allSettled([
                this.getStudios(),
                this.getMovies()
            ])

            return {
                studios: studiosResponse.status === 'fulfilled' ? studiosResponse.value : [],
                movies: moviesResponse.status === 'fulfilled' ? moviesResponse.value : [],
                genres: [] // ✅ Valor por defecto ya que no tienes endpoint para genres
            }
        }
    },

    async getAllData() {
        try {
            const filterData = await this.getFilterData()

            return {
                studios: Array.isArray(filterData.studios) ? filterData.studios : [],
                movies: Array.isArray(filterData.movies) ? filterData.movies : [],
                genres: Array.isArray(filterData.genres) ? filterData.genres : []
            }
        } catch (error) {
            throw error
        }
    },

    async getStats() {
        const response = await apiClient.get(ENDPOINTS.STATS)
        return response.data
    },

    async transferMovie(movieId, fromStudio, toStudio) {
        if (!movieId || !fromStudio || !toStudio) {
            throw new Error('Missing required parameters for movie transfer')
        }

        const requestData = {
            movieId,
            fromStudio: fromStudio.toLowerCase(),
            toStudio: toStudio.toLowerCase()
        }

        const response = await apiClient.post(ENDPOINTS.TRANSFER, requestData)
        return response.data
    },

    async searchMoviesWithFilters(filters = {}) {
        const params = {}

        if (filters.title?.trim()) params.title = filters.title.trim()
        if (filters.studio) params.studio = filters.studio

        if (filters.priceRange) {
            if (filters.priceRange.min > 0) params.minPrice = filters.priceRange.min
            if (filters.priceRange.max < 1000) params.maxPrice = filters.priceRange.max
        }


        try {
            const response = await apiClient.get(ENDPOINTS.MOVIES, { params })

            return response.data
        } catch (error) {
            return []
        }
    }
}
