import { apiClient } from './api'
import { ENDPOINTS } from './endpoints'

export const movieApi = {
    async getStudios() {
        console.log('🔍 Calling getStudios...')
        return await apiClient.get(ENDPOINTS.STUDIOS)
    },

    async getMovies() {
        console.log('🔍 Calling getMovies...')
        return await apiClient.get(ENDPOINTS.MOVIES)
    },

    async getAllData() {
        console.log('🔍 Calling getAllData...')
        try {
            const [studios, movies] = await Promise.all([
                this.getStudios(),
                this.getMovies()
            ])

            console.log('✅ Data obtained:', { studiosCount: studios.length, moviesCount: movies.length })
            return { studios, movies }
        } catch (error) {
            console.error('❌ Error in getAllData:', error)
            throw error
        }
    },
}
