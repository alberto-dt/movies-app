import { useState, useEffect } from 'react'
import { movieApi } from '../services'

const INITIAL_STATE = {
    studios: [],
    movies: [],
    loading: true,
    error: null
}

const LOADING_STATE = {
    studios: [],
    movies: [],
    loading: true,
    error: null
}
const createSuccessState = (studios, movies) => ({
    studios: studios || [],
    movies: movies || [],
    loading: false,
    error: null
})

const createErrorState = (error) => ({
    studios: [],
    movies: [],
    loading: false,
    error: error.message
})

const fetchMovieData = async () => {
    if (!movieApi?.getAllData) {
        throw new Error('movieApi is not available')
    }

    console.log('🚀 Getting data...')
    const data = await movieApi.getAllData()

    console.log('✅ Data obtained:', {
        studiosCount: data.studios?.length || 0,
        moviesCount: data.movies?.length || 0
    })

    return data
}
export const useApiData = () => {
    const [state, setState] = useState(INITIAL_STATE)

    useEffect(() => {
        let isMounted = true

        setState(LOADING_STATE)

        fetchMovieData()
            .then(({ studios, movies }) => {
                if (isMounted) {
                    setState(createSuccessState(studios, movies))
                }
            })
            .catch(error => {
                console.error('❌ Error:', error)
                if (isMounted) {
                    setState(createErrorState(error))
                }
            })

        return () => {
            isMounted = false
        }
    }, [])

    return state
}
