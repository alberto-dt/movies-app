import { getMovieId } from './helpers'
import {VALIDATION_MESSAGES} from "@/constants";

export const validateMovie = (movie) => {
    if (!movie) return VALIDATION_MESSAGES.NO_MOVIE

    const movieId = getMovieId(movie)
    if (!movieId) return VALIDATION_MESSAGES.NO_MOVIE_ID

    return null
}

export const validateStudios = (fromStudio, toStudio) => {
    if (!fromStudio || !toStudio) {
        return VALIDATION_MESSAGES.MISSING_STUDIOS
    }

    if (fromStudio === toStudio) {
        return VALIDATION_MESSAGES.SAME_STUDIO
    }

    return null
}

export const validateTransferData = (movie, fromStudio, toStudio) => {
    return validateMovie(movie) || validateStudios(fromStudio, toStudio)
}
