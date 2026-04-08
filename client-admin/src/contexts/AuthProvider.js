import React, { Component } from "react"
import AuthContext from "./AuthContext"

class AuthProvider extends Component {
  constructor(props) {
    super(props)

    this.state = {
      // ===== GLOBAL STATE =====
      token: "",
      username: "",

      // ===== FUNCTIONS =====
      setToken: this.setToken,
      setUsername: this.setUsername,
      logout: this.logout
    }
  }

  setToken = (value) => {
    this.setState({ token: value })
  }

  setUsername = (value) => {
    this.setState({ username: value })
  }

  logout = () => {
    this.setState({
      token: "",
      username: ""
    })
  }

  render() {
    return (
      <AuthContext.Provider value={this.state}>
        {this.props.children}
      </AuthContext.Provider>
    )
  }
}

export default AuthProvider