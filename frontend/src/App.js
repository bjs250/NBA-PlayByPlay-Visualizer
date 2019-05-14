// Core dependencies
import React, { Component } from 'react';
import './App.css';

// External dependencies
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import List from 'react-list-select'
import axios from "axios";
import memoize from "memoize-one";

// Internal dependencies
import Chart from './components/Chart.js'
import BoxScore from './components/BoxScore.js'

class App extends Component {
  constructor(props) {
    super(props);

    // Initialize state
    this.state = {
      viewportWidth: 0,
      viewportHeight: 0,
      user_input: '',
      game_id: '0041800226',
      game_desc: '2019-05-10: GSW @ HOU',
      line_data: [],
      point_data: [],
      selectionMatrix: {},
      startDate: null,
      idList: [],
      quote: "",
      submissionErrorFlag: 0
    };

    // Bind event listeners
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this); 
    this.handleGameInputChange = this.handleGameInputChange.bind(this);
    this.handleGameSubmit = this.handleGameSubmit.bind(this);
    this.handleSelectionChange = this.handleSelectionChange.bind(this);
    this.handleDateChange = this.handleDateChange.bind(this);
    this.handleGameSelectionChange = this.handleGameSelectionChange.bind(this);
  }

  componentDidMount() {

    // Retrieve quote from file
    axios.get('games/quotes/')
      .then(response => response.data)
      .then(text => {
        this.setState({
          quote: text
        })
      }).catch(error => console.log(error))

    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);

  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }

  updateWindowDimensions() {
    this.setState({ viewportWidth: window.innerWidth, viewportHeight: window.innerHeight });
  }

  handleDateChange(date) {
    this.setState({
      startDate: date
    });

    const month = date.getMonth() + 1
    const day = date.getDate()
    const year = date.getFullYear()
    const newDate = month + "-" + day + "-" + year;

    axios.get('games/date/' + newDate + '#')
      .then(res => res.data)
      .then(res =>
        this.setState({
          idList: res
        })
      ).catch(error => console.log(error))
  }

  handleGameSelectionChange(index){
    const game = this.state.idList[index]
    const date = this.state.startDate
    const month = date.getMonth() + 1
    const day = date.getDate()
    const year = date.getFullYear()
    const newDate = month + "-" + day + "-" + year;

    this.setState({
      game_id: game["id"],
      game_desc: newDate + ": " + game["description"],
      line_data: [],
      point_data: [],
      selectionMatrix: {}
    })
  }

  load_data = memoize(
    (game_id) => {

      // Data for the score differential (used by Scatterplot)
      axios.get('games/PBP/line/' + game_id + '#')
        .then(res => res.data)
        .then(res =>
          this.setState({
            line_data: res
          })
        ).catch(error => console.log(error))

      // Data for the data points (used by Scatterplot)
      axios.get('games/PBP/data/' + game_id + '#')
        .then(res => res.data)
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
        ).catch(error => console.log(error))

    }
  )

  // Retain and update the value of state.user_input
  handleGameInputChange = (event) => {
    this.setState({ user_input: event.target.value })
  }

  // Make a request to the back-end using the current state.user_input
  handleGameSubmit = (event) => {
    event.preventDefault();
    axios.get("/games/" + this.state.user_input)
      .then(res => JSON.parse(res.data))
      .then(res => {
        this.setState({
          game_id: res[0]["fields"]["game_id"],
          game_desc: res[0]["fields"]["date"] + ": " + res[0]["fields"]["home"] + " @ " + res[0]["fields"]["away"],
          line_data: [],
          point_data: [],
          selectionMatrix: {},
          submissionErrorFlag: 0

        });
      })
      .catch(err => {
        this.setState({
          submissionErrorFlag: 1
        });
      });
    console.log("Submission Triggered")
  };

  // Handle changes to the BoxScore selection from the BoxScore component
  handleSelectionChange = (player, column, value) => {
    var new_sel = this.state.selectionMatrix

    if (Object.keys(new_sel).includes(player)) { //TODO: fix
      switch (column) {
        case "FTM":
          new_sel[player]["1"]["Made"] = value
          break;
        case "-FTM":
          new_sel[player]["1"]["Miss"] = value
          break;
        case "2PM":
          new_sel[player]["2"]["Made"] = value
          break;
        case "-2PM":
          new_sel[player]["2"]["Miss"] = value
          break;
        case "3PM":
          new_sel[player]["3"]["Made"] = value
          break;
        case "-3PM":
          new_sel[player]["3"]["Miss"] = value
          break;
        case "PF":
          new_sel[player]["FOUL"] = value
          break;
        default:
          new_sel[player][column] = value
      }
    }

    this.setState({
      selectionMatrix: new_sel
    })

  }

  render() {
    // For chart dimensions
    const { viewportWidth, viewportHeight } = this.state
    const height = .60*viewportHeight;
    const width = .80*viewportWidth;
    
    var margin = { top: 50, right: 10, bottom: 10, left: 115 }

    this.load_data(this.state.game_id)

    var { selectionMatrix, idList, quote, game_id, game_desc } = this.state

    return (
      <div className="App">

        <h1>{game_desc}</h1>
        <p className="quote">{quote}</p>

        <div className="container">
          <div className="row">

            <div className="col">

              <form>
                <p>Enter an NBA Game ID* here to load data or...</p>
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
                {this.state.submissionErrorFlag === 1 ? <p id="gameIDerror">There was a problem retrieving that ID</p> : null}


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
                  multiple={false}
                  onChange={(selected) => {this.handleGameSelectionChange(selected)}}
                /> : <p>(No Game ID's for chosen date)</p>}
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
            game_id={game_id}
          >
          </Chart> : null}

        <br></br>

        {Object.keys(selectionMatrix).length > 0 ?
          <BoxScore
            team={"Home"}
            handleSelectionChange={this.handleSelectionChange}
            game_id={game_id}
            viewportWidth={viewportWidth}
          >
          </BoxScore> : null}

        <br></br>

        {Object.keys(selectionMatrix).length > 0 ?
          <BoxScore
            team={"Away"}
            handleSelectionChange={this.handleSelectionChange}
            game_id={game_id}
            viewportWidth={viewportWidth}
          >
          </BoxScore> : null}

        <br></br>

        <p className="hints">
          <u>Usage Hints</u>:<br />
          Get started by selecting a game by using the datepicker.<br />
          If the game you are looking for does not appear, you will need to find the Game ID on stats.nba.com and input it manually on the left.<br />
          <br />
          Columns highlighted in blue in the BoxScore are selectable. Clicking on the cell will render the corresponding points on the plot.<br />
          The checkboxes on the left and bottom allow you to select the entire row and column respectively.<br />
          The checkbox in the very top left will select or deselect all of the data.
          Also note that clicking on the column header will sort the BoxScore by that column.<br />
          <br />
          If you hover over a point in the line chart, a tooltip will show you the full description of the data point.<br />
          You can use your mouse wheel to zoom in and out.<br />
          Clicking and dragging will allow you to move the data in the plot.<br />
          You can adjust the YScale and XScale using the buttons in the dashboard below.<br />
          You can also limit the scope of the data by Quarter using the corresponding buttons.
          <br />
          <br />


          <b>*</b> The easiest way to find a Game ID is to figure out what day the game happened and go to https://stats.nba.com/scores/mm/dd/yyyy
          <br /> Select the BoxScore for the relevant game and the ID will be in the URL
          <br /> Future release to automate this process

          <br /><br />

        </p>

      </div>
    );
  }

}

export default App;