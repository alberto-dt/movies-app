import './App.css'
import React, {useMemo} from 'react'
import {Avatar, Card, Grid, Typography} from '@material-ui/core'
import {useApiData} from './hooks/useApiData'
import {DEFAULT_AVATAR, GRID_BREAKPOINTS} from "./utils/constants";
import {generateMovieKey} from "./utils/helpers";
import Loading from "./components/common/Loading/Loading";


const App = () => {
    const {studios, movies, loading} = useApiData(true)

    const studiosMap = useMemo(() => {
        return studios.reduce((acc, studio) => {
            acc[studio.id] = studio.name
            return acc
        }, {})
    }, [studios])

    if (loading) {
        return <Loading message="Loading movies and studios..." />;
    }

    return (
      <div className="App">
          <div className="App-studios App-flex">
          <h3>Images:</h3>
              <Grid container justifyContent="center" alignItems="center">
                  {movies.map(movie => (
                      <Grid item xs={GRID_BREAKPOINTS.xs} sm={GRID_BREAKPOINTS.sm} lg={GRID_BREAKPOINTS.lg} key={generateMovieKey(movie)}>
                          <Card className="regularCard">
                              <Avatar
                                  alt={movie.name}
                                  src={movie.img || DEFAULT_AVATAR}
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
                                  {studiosMap[movie.studioId] || 'Studio not found'}
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
