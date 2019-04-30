import React from 'react';
import ReactTable from 'react-table'
import '../styles/BoxScore.css'

class MyTable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selected: {},
      selectAll: 0,
      data: []
    };

    this.toggleRow = this.toggleRow.bind(this);
  }

  componentDidMount() {
    console.log("BoxScore mount")
    fetch('http://localhost:8000/games/BS/0041800104#')
      .then(res => res.json())
      .then(res =>
        this.setState({
          data: res
        })
      )

  }

  toggleRow(Player) {
    const newSelected = Object.assign({}, this.state.selected);
    newSelected[Player] = !this.state.selected[Player];
    this.setState({
      selected: newSelected,
      selectAll: 2
    });
  }

  toggleSelectAll() {
    let newSelected = {};
    //Object.keys(data["Unnamed: 0"])

    if (this.state.selectAll === 0) {
      Object.keys(this.state.data["Unnamed: 0"]).forEach(x => {
        newSelected[this.state.data["Unnamed: 0"][x]] = true;
      });
    }

    this.setState({
      selected: newSelected,
      selectAll: this.state.selectAll === 0 ? 1 : 0
    });
  }

  render() {
    const { data } = this.state;
    console.log("data",data.length)


    if (data.length) // make sure data has been loaded
    {

      // Sort the data into two tables: home and away
      var formatted_data_home = []
      var formatted_data_visit = []
      var flag = "home"

      for (var i = 0; i < Object.keys(data["Unnamed: 0"]).length; i++) {
        if (flag === "home") {
          formatted_data_home.push({
            Player: data["Unnamed: 0"][i],
            MIN: data["MIN"][i],
            FGM: data["FGM"][i],
            FGPercent: data["FG%"][i],
            ThreePM: data["3PM"][i],
            ThreePA: data["3PA"][i],
            ThreePPercent: data["3P%"][i],
            FTM: data["FTM"][i],
            FTA: data["FTA"][i],
            FTPercent: data["FT%"][i],
            OREB: data["OREB"][i],
            DREB: data["DREB"][i],
            REB: data["REB"][i],
            AST: data["AST"][i],
            TOV: data["TOV"][i],
            STL: data["STL"][i],
            BLK: data["BLK"][i],
            PF: data["PF"][i],
            PTS: data["PTS"][i],
            PlusMinus: data["+/-"][i]
          }
          )
        }
        if (flag === "visit") {
          formatted_data_visit.push({
            Player: data["Unnamed: 0"][i],
            MIN: data["MIN"][i],
            FGM: data["FGM"][i],
            FGPercent: data["FG%"][i],
            ThreePM: data["3PM"][i],
            ThreePA: data["3PA"][i],
            ThreePPercent: data["3P%"][i],
            FTM: data["FTM"][i],
            FTA: data["FTA"][i],
            FTPercent: data["FT%"][i],
            OREB: data["OREB"][i],
            DREB: data["DREB"][i],
            REB: data["REB"][i],
            AST: data["AST"][i],
            TOV: data["TOV"][i],
            STL: data["STL"][i],
            BLK: data["BLK"][i],
            PF: data["PF"][i],
            PTS: data["PTS"][i],
            PlusMinus: data["+/-"][i]
          }
          )
        }
        // alter flag
        if (data["Unnamed: 0"][i].includes("Total")) {
          flag = "visit"
        }
      }

      var footers = []
      footers.push(formatted_data_home[formatted_data_home.length - 1])
      footers.push(formatted_data_visit[formatted_data_visit.length - 1])
      formatted_data_home.pop()
      formatted_data_visit.pop()

      var headers = ['Player', 'MIN', 'FGM', 'FG%', '3PM', '3PA', '3P%', 'FTM', 'FTA', 'FT%', 'OREB', 'DREB', 'REB', 'AST', 'TOV', 'STL', 'BLK', 'PF', 'PTS', '+/-']
      var accessors = ['Player', 'MIN', 'FGM', 'FGPercent', 'ThreePM', 'ThreePA', 'ThreePPercent', 'FTM', 'FTA', 'FTPercent', 'OREB', 'DREB', 'REB', 'AST', 'TOV', 'STL', 'BLK', 'PF', 'PTS', 'PlusMinus']

      var home_columns = []
      var check = {
        id: "checkbox",
        accessor: "",
        Cell: ({ original }) => {
          return (
            <input
              type="checkbox"
              className="checkbox"
              checked={this.state.selected[original.Player] === true}
              onChange={() => this.toggleRow(original.Player)}
            />
          );
        },Header: x => {
          return (
            <input
              type="checkbox"
              className="checkbox"
              checked={this.state.selectAll === 1}
              ref={input => {
                if (input) {
                  input.indeterminate = this.state.selectAll === 2;
                }
              }}
              onChange={() => this.toggleSelectAll()}
            />
          );
        },
        sortable: false,
        width: 45,
      }
      home_columns.push(check)

      for (i = 0; i < headers.length; i++) {
        home_columns.push({ Header: headers[i], accessor: accessors[i], width: 50, Footer: (<strong>{footers[0][accessors[i]]}</strong>) })
      }

      var visit_columns = []
      for (i = 0; i < headers.length; i++) {
        visit_columns.push({ Header: headers[i], accessor: accessors[i], width: 50, Footer: (<strong>{footers[1][accessors[i]]}</strong>) })
      }

      // Change the width of the player column
      home_columns[1].width = 200
      visit_columns[0].width = 200

      //todo: change sort method of the min column

      return (
        <div>
          <p>Home</p>
          <ReactTable
            data={formatted_data_home}
            columns={home_columns}
            showPagination={false}
            defaultPageSize={formatted_data_home.length}
            defaultSortMethod={sort}
          />
          <p>Visit</p>
          <ReactTable
            data={formatted_data_visit}
            columns={visit_columns}
            showPagination={false}
            defaultPageSize={formatted_data_visit.length}
            defaultSortMethod={sort}
          />
        </div>
      );

    }

    else {
      return (
        <div>
          Loading
        </div>
      )
    }
  }
}

export default MyTable;

function sort(a, b, desc) {
  // force null and undefined to the bottom
  a = a === null || a === undefined ? '' : a
  b = b === null || b === undefined ? '' : b
  // check if numeric
  if (isNumeric(a) && isNumeric(b)) {
    a = parseInt(a)
    b = parseInt(b)
  }
  else {
    // check if MIN column
    if (a.includes(":") && b.includes(":")) {
      var minute;
      var second;
      minute = a.split(":")[0]
      second = a.split(":")[1]
      a = parseInt(minute) * 60 + parseInt(second)
      minute = b.split(":")[0]
      second = b.split(":")[1]
      b = parseInt(minute) * 60 + parseInt(second)
    }
    else {
      // force any string values to lowercase
      a = typeof a === 'string' ? a.toLowerCase() : a
      b = typeof b === 'string' ? b.toLowerCase() : b
    }
  }

  // Return either 1 or -1 to indicate a sort priority
  if (a > b) {
    return 1
  }
  if (a < b) {
    return -1
  }
  // returning 0, undefined or any falsey value will use subsequent sorts or
  // the index as a tiebreaker
  return 0
}

function isNumeric(num) {
  return !isNaN(num)
}