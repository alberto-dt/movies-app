import { movieApi } from '@/services'

export const fetchMovieData = async () => {
    if (!movieApi?.getAllData) {
        throw new Error('movieApi is not available')
    }
    return await movieApi.getAllData()
}
