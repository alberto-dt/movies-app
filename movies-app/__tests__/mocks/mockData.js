// Mock data based on real backend structure
export const movieAge = [
    { movieId: '11', years: '19' },
    { movieId: '12', years: 5 },
    { movieId: '13', years: 0 },
    { movieId: '14', years: '9 goles' },
    { movieId: '21', years: 35 },
    { movieId: '22', years: ' 5' },
    { movieId: '23', years: 0 },
    { movieId: '24' }, // missing years
    { movieId: '31', years: 22 },
    { movieId: '32', years: 5 },
    { movieId: '33', years: null },
    { movieId: '34', years: 3 }
]

export const GENRE_ID = {
    adventures: 9,
    horror: 6,
    animation: 4,
    heroes: 1
}

export const GENRE_STRING = {
    [GENRE_ID.adventures]: 'ADV',
    [GENRE_ID.horror]: 'HOR',
    [GENRE_ID.animation]: 'ANI',
    [GENRE_ID.heroes]: 'HER',
}

export const mockDisney = {
    id: '1',
    name: 'Disney studios',
    shortName: 'Disney',
    logo: 'https://cdn.mos.cms.futurecdn.net/qfFFFhnM8LwZnjpTECN3oB.jpg',
    money: 1000,
    movies: [
        {
            id: '11',
            name: 'Nightmare before christmas',
            genre: GENRE_ID.horror,
            img: 'https://m.media-amazon.com/images/M/MV5BNmYxOTAzZWYtOGI3Yi00ODc3LTk5ZjYtZTY0MzVkZTg3YmRiXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg',
            price: 600,
        },
        {
            id: '12',
            name: 'Aladdin',
            genre: GENRE_ID.animation,
            url: 'https://lumiere-a.akamaihd.net/v1/images/p_aladdin1992_20486_174ba005.jpeg',
            price: 10000000000,
        },
        {
            id: '13',
            name: 'The avengers',
            genre: GENRE_ID.heroes,
            url: 'https://upload.wikimedia.org/wikipedia/en/8/8a/The_Avengers_%282012_film%29_poster.jpg',
            price: 300,
        },
        {
            id: '14',
            name: 'John Carter',
            genre: GENRE_ID.adventures,
            url: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/aa/John_carter_poster.jpg/220px-John_carter_poster.jpg',
            price: 400,
        },
    ]
}

export const mockWarner = {
    id: '2',
    name: 'Warner Bros.',
    shortName: 'Warner',
    logo: 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/12c6f684-d447-4457-84fa-12033cfd581e/d9z4nxu-626ae303-e830-4b4f-ab8b-4aff7f1bef0f.jpg',
    money: 900,
    movies: [
        {
            id: '21',
            name: 'The conjuring',
            genre: GENRE_ID.horror,
            img: 'https://m.media-amazon.com/images/M/MV5BMTM3NjA1NDMyMV5BMl5BanBnXkFtZTcwMDQzNDMzOQ@@._V1_FMjpg_UX1000_.jpg',
            price: 1000000000,
        },
        {
            id: '22',
            name: 'Space Jame',
            genre: GENRE_ID.animation,
            img: 'https://m.media-amazon.com/images/M/MV5BNjJiMTYyNTktZTVhNi00NzhlLWI4MmUtOTc3ZjA2MmM3MTI2XkEyXkFqcGc@._V1_.jpg',
            price: 500,
        },
        {
            id: '23',
            name: 'The dark knight rises',
            genre: GENRE_ID.heroes,
            url: 'https://m.media-amazon.com/images/M/MV5BMTk4ODQzNDY3Ml5BMl5BanBnXkFtZTcwODA0NTM4Nw@@._V1_FMjpg_UX1000_.jpg',
            price: 400,
        },
        {
            id: '24',
            name: 'Fantastic beasts and where to find them',
            genre: GENRE_ID.adventures,
            img: 'https://m.media-amazon.com/images/S/pv-target-images/3482bd62d90d768b5702f9744c43901ad98dfc7627533c652af72f679d25e1d4.jpg',
            price: 500,
        },
    ]
}

export const mockSony = {
    id: '3',
    name: 'Sony Pictures',
    shortName: 'Sony',
    logo: 'https://logoeps.com/wp-content/uploads/2013/05/sony-pictures-entertainment-vector-logo.png',
    money: 700,
    movies: [
        {
            id: '31',
            name: 'Slender man',
            genre: GENRE_ID.horror,
            img: 'https://m.media-amazon.com/images/M/MV5BMjE0MzcwMDAyNl5BMl5BanBnXkFtZTgwMzc4ODg0NDM@._V1_UY1200_CR90,0,630,1200_AL_.jpg',
            price: 700,
        },
        {
            id: '32',
            name: 'Spider-man into the spider-verse',
            genre: GENRE_ID.animation,
            img: 'https://m.media-amazon.com/images/M/MV5BMjMwNDkxMTgzOF5BMl5BanBnXkFtZTgwNTkwNTQ3NjM@._V1_.jpg',
            price: 450,
        },
        {
            id: '33',
            name: 'Spider-man',
            genre: GENRE_ID.heroes,
            img: 'https://m.media-amazon.com/images/M/MV5BZDEyN2NhMjgtMjdhNi00MmNlLWE5YTgtZGE4MzNjMTRlMGEwXkEyXkFqcGdeQXVyNDUyOTg3Njg@._V1_FMjpg_UX1000_.jpg',
            price: 500,
        },
        {
            id: '34',
            name: 'Last action hero',
            genre: GENRE_ID.adventures,
            img: 'https://m.media-amazon.com/images/I/81H0m4K-YaL._UF894,1000_QL80_.jpg',
            price: 10000000000000,
        },
    ]
}

// Array de studios para las respuestas de API
export const mockStudios = [mockDisney, mockWarner, mockSony]

// Array de todas las películas para las respuestas de API
export const mockMovies = [
    ...mockDisney.movies,
    ...mockWarner.movies,
    ...mockSony.movies
]

// Map de estudios por ID (igual que en el backend)
export const studiosMap = {
    1: mockDisney,
    2: mockWarner,
    3: mockSony
}

// Géneros únicos extraídos de las películas
export const mockGenres = Object.values(GENRE_STRING)

export const mockFilterData = {
    studios: mockStudios,
    movies: mockMovies,
    genres: mockGenres
}

// Stats calculadas basadas en datos reales
export const mockStats = {
    totalMovies: mockMovies.length,
    totalStudios: mockStudios.length,
    totalMoney: mockStudios.reduce((sum, studio) => sum + studio.money, 0),
    averagePrice: mockMovies.reduce((sum, movie) => sum + movie.price, 0) / mockMovies.length,
    moviesByStudio: {
        'Disney studios': mockDisney.movies.length,
        'Warner Bros.': mockWarner.movies.length,
        'Sony Pictures': mockSony.movies.length
    },
    moviesByGenre: {
        [GENRE_STRING[GENRE_ID.horror]]: mockMovies.filter(m => m.genre === GENRE_ID.horror).length,
        [GENRE_STRING[GENRE_ID.animation]]: mockMovies.filter(m => m.genre === GENRE_ID.animation).length,
        [GENRE_STRING[GENRE_ID.heroes]]: mockMovies.filter(m => m.genre === GENRE_ID.heroes).length,
        [GENRE_STRING[GENRE_ID.adventures]]: mockMovies.filter(m => m.genre === GENRE_ID.adventures).length,
    },
    expensiveMovies: mockMovies.filter(m => m.price > 1000000000),
    cheapestMovie: mockMovies.reduce((min, movie) => movie.price < min.price ? movie : min),
    mostExpensiveMovie: mockMovies.reduce((max, movie) => movie.price > max.price ? movie : max)
}

// Helpers para crear respuestas de API
export const createSuccessResponse = (data) => ({
    data,
    status: 200,
    statusText: 'OK'
})

export const createErrorResponse = (message, status = 500) => {
    const error = new Error(message)
    error.response = {
        status,
        statusText: status === 404 ? 'Not Found' : 'Internal Server Error',
        data: { message }
    }
    return error
}

// Mock de transferencia exitosa
export const mockTransferSuccess = {
    success: true,
    message: 'Movie transferred successfully',
    data: {
        movieId: '11',
        fromStudio: 'disney studios',
        toStudio: 'warner bros.',
        transferDate: new Date().toISOString()
    }
}

// Helper para buscar película por ID
export const findMovieById = (movieId) => {
    return mockMovies.find(movie => movie.id === movieId)
}

// Helper para buscar estudio por nombre
export const findStudioByName = (studioName) => {
    return mockStudios.find(studio =>
        studio.name.toLowerCase().includes(studioName.toLowerCase()) ||
        studio.shortName.toLowerCase().includes(studioName.toLowerCase())
    )
}

// Helper para filtrar películas
export const filterMovies = (filters = {}) => {
    let filtered = [...mockMovies]

    if (filters.title) {
        filtered = filtered.filter(movie =>
            movie.name.toLowerCase().includes(filters.title.toLowerCase())
        )
    }

    if (filters.genre) {
        filtered = filtered.filter(movie => movie.genre === filters.genre)
    }

    if (filters.minPrice) {
        filtered = filtered.filter(movie => movie.price >= filters.minPrice)
    }

    if (filters.maxPrice) {
        filtered = filtered.filter(movie => movie.price <= filters.maxPrice)
    }

    if (filters.studio) {
        const studio = findStudioByName(filters.studio)
        if (studio) {
            filtered = filtered.filter(movie =>
                studio.movies.some(studioMovie => studioMovie.id === movie.id)
            )
        }
    }

    return filtered
}
