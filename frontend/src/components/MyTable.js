import React, { Component } from 'react';
import ReactTable from 'react-table'
import 'react-table/react-table.css'



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

      console.log("data", data)
      console.log("keys", Object.keys(data["Unnamed: 0"]).length)

      var formatted_data = [];
      for (var i = 0; i < Object.keys(data["Unnamed: 0"]).length; i++) {
        formatted_data.push({
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

      var headers = ['Player','MIN','FGM','FG%','3PM','3PA','3P%','FTM','FTA','FT%','OREB','DREB','REB','AST','TOV','STL','BLK','PF','PTS','+/-']
      var accessors = ['Player','MIN','FGM','FGPercent','ThreePM','ThreePA','ThreePPercent','FTM','FTA','FTPercent','OREB','DREB','REB','AST','TOV','STL','BLK','PF','PTS','PlusMinus']

      var columns = []
      for (var i = 0; i < headers.length; i++) {
        columns.push({Header:headers[i],accessor:accessors[i]})
      }
      console.log(columns)

      return (
        <div>
          <ReactTable
            data={formatted_data}
            columns={columns}
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