import React, { Component } from 'react';
import './App.css';
import axios from "axios";
import * as d3 from 'd3';
import PBP_Graph from './components/PBP_Graph.js'

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

        <div>
        <PBP_Graph 
          width={width}
          height={height}
        />
        </div>

      </div>
    );
  }

}

export default App;