import React, { Component } from 'react';
import ReactTable from 'react-table'
import 'react-table/react-table.css'



class MyTable extends React.Component {
	constructor(props) {
		super(props);

		this.state = { data: [] };

	}

	render() {
        const data = [{
          player: 'Lebron James',
          reb: "5",
          

        }]
       
        const columns = [{
          Header: 'Player',
          accessor: 'player' // String-based value accessors!
        }, {
          Header: 'REB',
          accessor: 'reb'
        },
        {
            Header: 'AST',
            accessor: 'ast'
          } 
        ]
        
        console.log("data",data)

		return (
			<div>
				<ReactTable
					data={data}
					columns={columns}
				/>
			</div>
		);
	}
}

export default MyTable;