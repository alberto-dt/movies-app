import './App.css'
import React, {useMemo} from 'react'
import {Avatar, Card, Grid, Typography} from '@material-ui/core'
import {useApiData} from './hooks/useApiData'

const defaultAvatar = 'https://image.shutterstock.com/image-vector/male-avatar-profile-picture-vector-600w-149083895.jpg'

const App = () => {
    const {studios, movies, loading} = useApiData(true)

    const studiosMap = useMemo(() => {
        return studios.reduce((acc, studio) => {
            acc[studio.id] = studio.name
            return acc
        }, {})
    }, [studios])

    if (loading) {
        return (
            <div className="App">
                <Typography variant="h6" align="center">
                    Loading movies and studios...
                </Typography>
            </div>
        )
  }

    return (
      <div className="App">
          <div className="App-studios App-flex">
          <h3>Images:</h3>
              <Grid container justifyContent="center" alignItems="center">
                  {movies.map(movie => (
                      <Grid item xs={12} sm={6} lg={4} key={movie.id || `movie-${movie.name}-${movie.position}`}>
                          <Card className="regularCard">
                              <Avatar
                                  alt={movie.name}
                                  src={movie.img || defaultAvatar}
                                  style={{margin: 5, width: 280, height: 280}}
                              />
                              <div>
                                  <Typography style={{disaplay: 'inline-block'}}>
                      {movie.name + ' '}
                                      <Typography
                                          component="span"
                                          style={{fontWeight: 'bold', display: 'inline-block'}}>
                                          >
                        {movie.position}
                                      </Typography>
                    </Typography>
                              </div>
                              <Typography>
                                  {studiosMap[movie.studioId] || 'Studio no encontrado'}
                              </Typography>
                </Card>
                      </Grid>
                  ))}
          </Grid>
        </div>
      </div>
    )
}

export default App
