import "./App.css"
import React, { Component } from "react"
import AuthProvider from "./contexts/AuthProvider"
import Login from "./components/LoginComponent"
import Main from "./components/MainComponent"
import { BrowserRouter } from 'react-router-dom';

class App extends Component {
  render() {
    return (
      <AuthProvider>
        <Login />
        <BrowserRouter>
          <Main />
        </BrowserRouter>
      </AuthProvider>
    )
  }
}

export default App