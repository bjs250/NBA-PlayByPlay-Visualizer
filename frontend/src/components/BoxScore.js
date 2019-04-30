import React from 'react';
import ReactTable from 'react-table'
import '../styles/BoxScore.css'

class MyTable extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selected: {},
            selectAll: 0,
            data: [],
        };

        this.toggleRow = this.toggleRow.bind(this);
    }

    componentDidMount() {
        console.log("BoxScore mount")
        fetch('http://localhost:8000/games/BS/0041800104#')
            .then(res => res.json())
            .then(res => {
                // Choose home data or away data
                var home_team = res[0]["TEAM"]
                var raw_data;
                if (this.props.team === "Home") {
                    raw_data = res.filter(function (row) {
                        return row["TEAM"] === home_team;
                    });
                }
                else {
                    raw_data = res.filter(function (row) {
                        return row["TEAM"] !== home_team;
                    });
                }
                this.setState({
                    data: raw_data
                })
            }
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

        if (this.state.selectAll === 0) {
            this.state.data.forEach(x => {
                newSelected[x["PLAYER"]] = true;
            });
        }

        this.setState({
            selected: newSelected,
            selectAll: this.state.selectAll === 0 ? 1 : 0
        });
    }

    render() {
        const { data } = this.state;
        
        if (data.length) // make sure data has been loaded
        {

            const footer = data[data.length - 1]
            const headers = ['PLAYER', 'MIN', 'FGM', 'FG%', '3PM', '3PA', '3P%', 'FTM', 'FTA', 'FT%', 'OREB', 'DREB', 'REB', 'AST', 'TOV', 'STL', 'BLK', 'PF', 'PTS', '+/-']
            const accessors = headers

            var check = {
                id: "checkbox",
                accessor: "",
                Cell: ({ original }) => {
                    return (
                        <input
                            type="checkbox"
                            className="checkbox"
                            checked={this.state.selected[original["PLAYER"]] === true}
                            onChange={() => this.toggleRow(original["PLAYER"])}
                        />
                    );
                }, Header: x => {
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
            
            var columns = []
            columns.push(check)

            for (var i = 0; i < headers.length - 1; i++) {
                columns.push({ Header: headers[i], accessor: accessors[i], width: 50, Footer: (<strong>{footer[accessors[i]]}</strong>) })
            }

            // Change the width of the player column
            columns[1].width = 200

            return (
                <div>
                    <p>{this.props.team}</p>
                    <ReactTable
                        data={data.slice(0, data.length - 1)}
                        columns={columns}
                        showPagination={false}
                        defaultPageSize={data.length-1}
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