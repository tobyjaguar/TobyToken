import React, { Component } from 'react'
import { Route } from 'react-router'
import HomeContainer from './layouts/home/HomeContainer'
import MyAppBar from './layouts/AppBar'

// Styles
import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

class App extends Component {
  render() {
    return (
      <div className="App">
        <MyAppBar />
        <Route exact path="/" component={HomeContainer} />
      </div>
    );
  }
}

export default App
