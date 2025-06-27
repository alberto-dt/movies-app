import './App.css'
import React, {PureComponent} from 'react'
import {Avatar, Card, Grid, Typography} from '@material-ui/core'

//TODO: 2 Move these calls into a proper api layer
const domain = 'http://localhost:3001'
const defaultAvatar = 'https://image.shutterstock.com/image-vector/male-avatar-profile-picture-vector-600w-149083895.jpg'

//TODO: 1 this is a really old class component refactor it into a modern functional component
class App extends PureComponent {
  constructor() {
    super();
    this.state = {
      studios: [],
      movies: [],
      avatarSize: 280,
      cardStyle: 'regularCard'
    }
    this.responsiveStyle = this.responsiveStyle.bind(this);
  }

  componentDidMount() {
    window.addEventListener('resize', this.responsiveStyle)
    fetch(`${domain}/studios`)
      .then(response => {
        return response.json();
      })
      .then(studios => {
        this.setState({studios})
      });
    fetch(`${domain}/movies`)
      .then(response => {
        return response.json();
      })
      .then(movies => {
        this.setState({movies})
      });
  }

  responsiveStyle() {
    //TODO: produce a better resize strategy
    if (window.innerWidth < 601) {
      console.log(window.innerWidth)
      this.setState({avatarSize: 60, cardStyle: 'smallCard'})
    } else {
      this.setState({avatarSize: 280, cardStyle: 'regularCard'})
    }
  }


  render() {
    const {movies, studios, avatarSize} = this.state

    return (
      <div className="App">
        <div className="App-studios App-flex"> {
          //TODO: 4 Filter the movies by genre, price and title
        }
          <h3>Images:</h3>
          <Grid container justify="center" alignItems="center">
            {movies.map(movie =>
              //TODO: 3 move styles into a separate js file and export this class using withStyles or similar or just to css file
              <Grid item xs={12} sm={6} lg={4}>
                <Card className={this.state.cardStyle}>
                  <Avatar alt={movie.name} src={movie.img ? movie.img : defaultAvatar}
                          style={{margin: 5, width: avatarSize, height: avatarSize}}/>
                  <div>
                    <Typography style={{display: 'inline-block'}}>
                      {movie.name + ' '}
                      <Typography style={{fontWeight: 'bold', display: 'inline-block'}}>
                        {movie.position}
                      </Typography>
                    </Typography>
                  </div>
                  <Typography>{
                    // eslint-disable-next-line
                    studios.map(studio => {
                    if (movie.studioId === studio.id) {
                      return studio.name
                    }
                  })}</Typography>
                </Card>
              </Grid>)}
          </Grid>
        </div>
      </div>
    )
  }
}

export default App
