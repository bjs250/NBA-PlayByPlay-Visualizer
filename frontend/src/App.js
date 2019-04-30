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
      user_input: '',
    };

    // Bind event listening methods here
    this.handleGameInputChange = this.handleGameInputChange.bind(this);
    this.handleGameSubmit = this.handleGameSubmit.bind(this);
  }

  // Retain and update the value of state.user_input
  handleGameInputChange = (event) => {
    this.setState({user_input: event.target.value})
  }

  // Make request to the back-end using the current state.user_input
  handleGameSubmit = (event) => {
    event.preventDefault();
    console.log("Current value of user input: " + this.state.user_input);
    axios
    .get("/games/"+this.state.user_input)
    .then(res => console.log(res.data))
    .catch(err => console.log(err));
  };

  render() {
    const height = 600;
    const width = 1000;
    var margin = {top: 50, right: 50, bottom: 10, left: 50}

    return (
      <div className="App">
        
        <h1>Header</h1>
        
        <form>
          <input 
            type='text'
            placeholder = "Enter ID here" 
            value={this.state.user_input}
            onChange={this.handleGameInputChange}
            />  
          <button
            onClick={this.handleGameSubmit}>
            Submit
          </button>
        </form> 

        <br></br>

        <Chart 
          width={width}
          height={height} 
          margin={margin}>
        </Chart>

        <br></br>

        <BoxScore>

        </BoxScore>

      </div>
    );
  }

}

export default App;