import { useState, useEffect, useCallback, useRef } from 'react'
import { API_STATES } from '@/constants'
import { createSuccessState, createErrorState } from '@/utils'
import {fetchMovieData} from "@hooks/apiOperations";

export const useApiData = () => {
    const [state, setState] = useState(API_STATES.INITIAL)
    const isMountedRef = useRef(true)
    const loadData = useCallback(async () => {
        setState(API_STATES.LOADING)
        try {
            const { studios, movies } = await fetchMovieData()
            if (isMountedRef.current) {
                setState(createSuccessState(studios, movies))
            }
        } catch (error) {
            if (isMountedRef.current) {
                setState(createErrorState(error))
            }
        }
    }, [])

    const refreshData = useCallback(() => {
        loadData()
    }, [loadData])

    useEffect(() => {
        isMountedRef.current = true
        loadData()

        return () => {
            isMountedRef.current = false
        }
    }, [loadData])

    return {
        ...state,
        refreshData
    }
}
