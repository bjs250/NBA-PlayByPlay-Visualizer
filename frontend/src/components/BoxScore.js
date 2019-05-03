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
            sel: {},
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

                const headers = ['PLAYER', 'MIN', 'FGM', 'FG%', '3PM', '3PA', '3P%', 'FTM', 'FTA', 'FT%', 'OREB', 'DREB', 'REB', 'AST', 'TOV', 'STL', 'BLK', 'PF', 'PTS', '+/-']
                var raw_sel = {}
                for (var i = 0; i < raw_data.length; i++) {
                    raw_sel[i] = {}
                    for (var j = 0; j < headers.length; j++) {
                        raw_sel[i][headers[j]] = 0
                    }
                }

                this.setState({
                    data: raw_data,
                    sel: raw_sel
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
        const { data, sel } = this.state;

        if (data.length) // make sure data has been loaded
        {
            //console.log("sel", this.state.sel)

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
                columns.push({
                    Header: headers[i],
                    accessor: accessors[i],
                    width: 50,
                    Footer: (<strong>{footer[accessors[i]]}</strong>),
                    getProps: (state, rowInfo, column) => {
                        return {
                            style: {
                                background: rowInfo && column && this.state.sel[rowInfo.index][column["Header"]] === 1 ? 'red' : null,
                                color: rowInfo && column && this.state.sel[rowInfo.index][column["Header"]] === 1 ? 'white' : 'black',
                            },
                        };
                    }
                })
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
                        defaultPageSize={data.length - 1}
                        defaultSortMethod={sort}
                        getTdProps={(state, rowInfo, column, instance) => {
                            return {
                                onClick: (e, handleOriginal) => {
                                    //console.log('A Td Element was clicked!')
                                    //console.log('it produced this event:', e)
                                    //console.log('It was in this column:', column)
                                    //console.log('It was in this row:', rowInfo)
                                    //console.log('It was in this table instance:', instance)

                                    //console.log(e.target)
                                    //console.log(rowInfo.original["PLAYER"], column["Header"])

                                    if (rowInfo && rowInfo.row && column && column["Header"]) {
                                        //console.log("index", rowInfo.index, column["Header"],this.state.sel[rowInfo.index][column["Header"]])
                                        var new_sel = Object.assign({}, this.state.sel);
                                        new_sel[rowInfo.index][column["Header"]] = this.state.sel[rowInfo.index][column["Header"]] === 0 ? 1 : 0
                                        //console.log("new_sel", new_sel)
                                        this.setState({
                                            sel: new_sel
                                        })
                                    }


                                    // IMPORTANT! React-Table uses onClick internally to trigger
                                    // events like expanding SubComponents and pivots.
                                    // By default a custom 'onClick' handler will override this functionality.
                                    // If you want to fire the original onClick handler, call the
                                    // 'handleOriginal' function.
                                    if (handleOriginal) {
                                        handleOriginal()
                                    }
                                }

                            }
                        }}
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