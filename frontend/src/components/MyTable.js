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
      console.log("keys",Object.keys(data["Unnamed: 0"]).length )

      var formatted_data = [];
      for (var i = 0; i < Object.keys(data["Unnamed: 0"]).length ; i++) 
      {
          formatted_data.push({
            player: data["Unnamed: 0"][i],
            reb: data["REB"][i],
            ast: data["AST"][i]
          })
      }
      
      const data2 = [{
        player: 'Lebron James',
        reb: "5",
      },
      {
        player: 'Kevin Durant',
        reb: "6",
      },
      ]

      console.log(data2)

      const columns = [{
        Header: 'Player',
        accessor: 'player'
      }, {
        Header: 'REB',
        accessor: 'reb'
      },
      {
        Header: 'AST',
        accessor: 'ast'
      }
      ]

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