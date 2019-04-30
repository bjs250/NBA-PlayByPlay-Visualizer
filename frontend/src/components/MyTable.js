import React, { Component } from 'react';
import ReactTable from 'react-table'
import 'react-table/react-table.css'
import '../styles/MyTable.css'

class MyTable extends React.Component {
  constructor(props) {
    super(props);

    this.state = { data: [] };

  }

  componentDidMount() {
    console.log("MyTable mount")
    fetch('http://localhost:8000/games/BS/0041800104#')
      .then(res => res.json())
      .then(res =>
        this.setState({
          data: res
        })
      )

  }

  render() {
    const { data } = this.state;

    if (Object.keys(data).length) // make sure data has been loaded
    {

      // Sort the data into two tables: home and away
      var formatted_data_home = [];
      var formatted_data_visit = [];
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
        )}
        else{
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
          })
        }
        if (data["Unnamed: 0"][i].includes("Total")) {
          flag = "visit"
        }
      }

      var headers = ['Player', 'MIN', 'FGM', 'FG%', '3PM', '3PA', '3P%', 'FTM', 'FTA', 'FT%', 'OREB', 'DREB', 'REB', 'AST', 'TOV', 'STL', 'BLK', 'PF', 'PTS', '+/-']
      var accessors = ['Player', 'MIN', 'FGM', 'FGPercent', 'ThreePM', 'ThreePA', 'ThreePPercent', 'FTM', 'FTA', 'FTPercent', 'OREB', 'DREB', 'REB', 'AST', 'TOV', 'STL', 'BLK', 'PF', 'PTS', 'PlusMinus']

      var columns = []
      for (var i = 0; i < headers.length; i++) {
        columns.push({ Header: headers[i], accessor: accessors[i], width: 50})
      }
      
      //
      columns[0].width = 200
      console.log("columns",columns[0])

      return (
        <div>
          <p>Home</p>
          <ReactTable className = "test"
            data={formatted_data_home}
            columns={columns}
            showPagination={false}
            defaultPageSize={formatted_data_home.length}
          />
          <p>Visit</p>
          <ReactTable
            data={formatted_data_visit}
            columns={columns}
            showPagination={false}
            defaultPageSize={formatted_data_visit.length}
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