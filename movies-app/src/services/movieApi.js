import {ENDPOINTS} from "@services/endpoints";
import {apiClient} from "@services/api";

export const movieApi = {
    async getStudios() {
        return await apiClient.get(ENDPOINTS.STUDIOS)
    },

    async getMovies() {
        return await apiClient.get(ENDPOINTS.MOVIES)
    },

    async getAllData() {
        try {
            const [studiosResponse, moviesResponse] = await Promise.all([
                this.getStudios(),
                this.getMovies()
            ])

            const studios = studiosResponse.data || studiosResponse;
            const movies = moviesResponse.data || moviesResponse;

            return { studios, movies }
        } catch (error) {
            throw error
        }
    },

    async getStats() {
        return await apiClient.get(ENDPOINTS.STATS)
    },

    async transferMovie(movieId, fromStudio, toStudio) {

        if (!movieId) {
            throw new Error('movieId is required');
        }
        if (!fromStudio) {
            throw new Error('fromStudio is required');
        }
        if (!toStudio) {
            throw new Error('toStudio is required');
        }

        const requestData = {
            movieId,
            fromStudio: fromStudio.toLowerCase(),
            toStudio: toStudio.toLowerCase()
        };

        try {
            return await apiClient.post(ENDPOINTS.TRANSFER, requestData);
        } catch (error) {
            throw error;
        }
    }
}
