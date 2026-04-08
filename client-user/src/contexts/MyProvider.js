import React, { Component } from "react";
import MyContext from "./MyContext";

class MyProvider extends Component {
  constructor(props) {
    super(props);

    this.state = {
      // variables
      token: "",
      user: null,
      mysaved: [],         

      // functions
      setToken: this.setToken,
      setUser: this.setUser,
      setMysaved: this.setMysaved, 
    };
  }

  setToken = (value) => {
    this.setState({ token: value });
  };

  setUser = (value) => {
    this.setState({ user: value });
  };

  setMysaved = (value) => {        
    this.setState({ mysaved: value });
  };

  render() {
    return (
      <MyContext.Provider value={this.state}>
        {this.props.children}
      </MyContext.Provider>
    );
  }
}

export default MyProvider;