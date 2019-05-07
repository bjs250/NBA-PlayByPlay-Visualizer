import React, { Component } from 'react';
import './App.css';

import axios from "axios";

// External dependencies
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import List from 'react-list-select'

// Internal dependencies
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
      selectionMatrix: {},
      startDate: new Date(),
      idList: []
    };

    // Bind event listening methods here
    this.handleGameInputChange = this.handleGameInputChange.bind(this);
    this.handleGameSubmit = this.handleGameSubmit.bind(this);
    this.handleSelectionChange = this.handleSelectionChange.bind(this);
    this.handleDateChange = this.handleDateChange.bind(this);
  }

  handleDateChange(date) {
    this.setState({
      startDate: date
    });

    const month = date.getMonth() + 1
    const day = date.getDate()
    const year = date.getFullYear()
    console.log(date, month, day, year)
    const newDate = month + "-" + day + "-" + year;

    fetch('http://localhost:8000/games/date/' + newDate + '#')
      .then(res => res.json())
      .then(res =>
        this.setState({
          idList: res
        })
      )
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
      .then(res => {
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
        })
      }
      )

  }

  // Retain and update the value of state.user_input
  handleGameInputChange = (event) => {
    this.setState({ user_input: event.target.value })
  }

  // Make request to the back-end using the current state.user_input
  handleGameSubmit = (event) => {
    event.preventDefault();
    console.log("Current value of user input: " + this.state.user_input);
    axios
      .get("/games/" + this.state.user_input)
      .then(res => console.log(res.data))
      .catch(err => console.log(err));
  };

  handleSelectionChange = (player, column, value) => {
    var new_sel = this.state.selectionMatrix
    switch (column) {
      case "FTM":
        new_sel[player]["1"]["Made"] = value
        break;
      case "FTMiss":
        new_sel[player]["1"]["Miss"] = value
        break;
      case "2PM":
        new_sel[player]["2"]["Made"] = value
        break;
      case "2PMiss":
        new_sel[player]["2"]["Miss"] = value
        break;
      case "3PM":
        new_sel[player]["3"]["Made"] = value
        break;
      case "3PMiss":
        new_sel[player]["3"]["Miss"] = value
        break;
      case "PF":
        new_sel[player]["FOUL"] = value
        break;
      default:
        new_sel[player][column] = value
    }

    // Update the state
    this.setState({
      selectionMatrix: new_sel
    })

  }

  render() {
    const height = 600;
    const width = 1200;
    var margin = { top: 50, right: 100, bottom: 10, left: 150 }
    var { selectionMatrix, point_data, idList } = this.state

    return (
      <div className="App">

        <h1>Header</h1>

          <div className="container">
            <div className="row">
              <div className="col">
                <form>
                  <p>Enter an NBA Game ID here to load data or...</p>
                  <input
                    type='text'
                    placeholder="Enter Game ID"
                    value={this.state.user_input}
                    onChange={this.handleGameInputChange}
                  />
                  <button
                    onClick={this.handleGameSubmit}>
                    Submit
                  </button>
                </form>
              </div>
              <div className="col">
                <p>Search for Game ID's using the datepicker:</p>
                <DatePicker
                  selected={this.state.startDate}
                  onChange={this.handleDateChange}
                />
              </div>
              <div className="col">
                <p>Select a Game ID based on date:</p>
                {Object.keys(idList).length > 0 ?
                  <List
                    items={idList.map(d => { return d["description"] + " (" + d["id"] + ")" })}
                    selected={[]}
                    disabled={[]}
                    multiple={true}
                    onChange={(selected) => { console.log(selected) }}
                  /> : <p>(No date selected)</p>}
              </div>
            </div>
          </div>
        
        <br></br>

        {Object.keys(selectionMatrix).length > 0 ?
          <Chart
            width={width}
            height={height}
            margin={margin}
            selectionMatrix={selectionMatrix}
          >
          </Chart> : null}

        <br></br>

        {/* Only render these once the selectionMatrix has been initialized */}
        {Object.keys(selectionMatrix).length > 0 ?
          <BoxScore
            team={"Home"}
            handleSelectionChange={this.handleSelectionChange}
          >
          </BoxScore> : null}

          <br></br>

        {Object.keys(selectionMatrix).length > 0 ?
          <BoxScore
            team={"Away"}
            handleSelectionChange={this.handleSelectionChange}
          >
          </BoxScore> : null}

        <br></br>

        <p>
          Instructions:
        </p>

      </div>
    );
  }

}

export default App;