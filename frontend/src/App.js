import React, { Component } from 'react';
import './App.css';
import axios from "axios";

import Chart from './components/Chart.js'
import BoxScore from './components/BoxScore.js'

class App extends Component {
  constructor(props) {
    super(props);

    // Initialize state here
    this.state = {
      user_input : '',
    };

    // Bind event listening methods here
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

  }

  // Retain and update the value of state.user_input
  handleInputChange = (event) => {
    this.setState({user_input: event.target.value})
  }

  // Make request to the back-end using the current state.user_input
  handleSubmit = (event) => {
    event.preventDefault();
    console.log("Current value of user input: " + this.state.user_input);
    axios
    .get("/games/"+this.state.user_input)
    .then(res => console.log(res.data))
    .catch(err => console.log(err));
  };

  render() {
    const height = 500;
    const width = 1000;
    var margin = {top: 25, right: 50, bottom: 25, left: 50}

    return (
      <div className="App">
        
        <h1>Header</h1>
        
        <form>
          <input 
            type='text'
            placeholder = "Enter ID here" 
            value={this.state.user_input}
            onChange={this.handleInputChange}
            />  
          <button
            onClick={this.handleSubmit}>
            Submit
          </button>
        </form> 

        <Chart 
          width={width}
          height={height} 
          margin={margin}>
        </Chart>

        <BoxScore>

        </BoxScore>

      </div>
    );
  }

}

export default App;