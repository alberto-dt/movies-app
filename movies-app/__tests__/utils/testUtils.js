const React = require('react')
const { render } = require('@testing-library/react')
const { ThemeProvider, createTheme } = require('@material-ui/core/styles')

const theme = createTheme()

const renderWithTheme = (component, options = {}) => {
    const Wrapper = ({ children }) => (
        React.createElement(ThemeProvider, { theme }, children)
    )

    return render(component, { wrapper: Wrapper, ...options })
}

const mockMovie = {
    id: '1',
    name: 'Test Movie',
    title: 'Test Movie',
    studioId: 1,
    year: 2023,
    genre: 'Action',
    price: 100,
    img: 'test-image.jpg'
}

const mockStudio = {
    id: 1,
    name: 'Disney'
}

const mockMovies = [
    mockMovie,
    {
        id: '2',
        name: 'Another Movie',
        title: 'Another Movie',
        studioId: 2,
        year: 2022,
        genre: 'Comedy',
        price: 150
    }
]

const mockStudios = [
    mockStudio,
    { id: 2, name: 'Warner' },
    { id: 3, name: 'Sony' }
]

const mockStats = {
    totalMovies: 10,
    totalStudios: 3,
    averagePrice: 125,
    moviesByStudio: {
        Disney: 4,
        Warner: 3,
        Sony: 3
    }
}

module.exports = {
    renderWithTheme,
    mockMovie,
    mockStudio,
    mockMovies,
    mockStudios,
    mockStats
}
