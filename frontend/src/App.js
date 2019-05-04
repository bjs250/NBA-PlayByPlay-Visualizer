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
      line_data: [],
      point_data: [],
      selectionMatrix: {}
    };

    // Bind event listening methods here
    this.handleGameInputChange = this.handleGameInputChange.bind(this);
    this.handleGameSubmit = this.handleGameSubmit.bind(this);
  }

  // Get data
  componentDidMount() {
    console.log("App mounted ")

    // Data for the score differential (used by Scatterplot)
    fetch('http://localhost:8000/games/PBP/line/0041800104#')
      .then(res => res.json())
      .then(res =>
          this.setState({
              line_data: res
          })
      )

    // Data for the data points (used by Scatterplot)
    fetch('http://localhost:8000/games/PBP/data/0041800104#')
      .then(res => res.json())
      .then(res =>
          {
            var raw_sel = {}
            Object.keys(res).forEach(function (d) {
              raw_sel[d] = {}
              raw_sel[d]["AST"] = 1
              raw_sel[d]["BLK"] = 0
              raw_sel[d]["STL"] = 0
              raw_sel[d]["TOV"] = 0
              raw_sel[d]["FOUL"] = 0
              raw_sel[d]["1"] = {}
              raw_sel[d]["1"]["Made"] = 1
              raw_sel[d]["1"]["Miss"] = 0
              raw_sel[d]["2"] = {}
              raw_sel[d]["2"]["Made"] = 1
              raw_sel[d]["2"]["Miss"] = 0
              raw_sel[d]["3"] = {}
              raw_sel[d]["3"]["Made"] = 1
              raw_sel[d]["3"]["Miss"] = 0
            })
            this.setState({
              point_data: res,
              selectionMatrix: raw_sel
          })}
      )

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
    var { selectionMatrix, point_data } = this.state

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
 
        <BoxScore
          team={"Home"}
          selectionMatrix={selectionMatrix}
          >
        </BoxScore>

        <BoxScore
          team={"Away"}
          selectionMatrix={selectionMatrix}
          >
        </BoxScore>

        <p>
          Instructions:
        </p>

      </div>
    );
  }

}

export default App;