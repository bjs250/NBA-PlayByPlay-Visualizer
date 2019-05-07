import React from 'react';
import ReactTable from 'react-table'
import '../styles/BoxScore.css'

class BoxScore extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selected: {},
            colSelected: {},
            selectAll: 0,
            data: [],
            sel: {},
        };

        this.toggleRow = this.toggleRow.bind(this);
    }

    /* Acquire boxscore data from backend (either home or visiting) and initialize the selection */
    componentDidMount() {

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

                const headers = ['PLAYER', 'MIN', 'FTM', '-FTM','FTA', 'FT%','2PM','-2PM','3PM','-3PM','3PA', '3P%','FGM', 'FG%', 'OREB', 'DREB', 'REB', 'AST', 'TOV', 'STL', 'BLK', 'PF', '+/-', 'PTS']
                const init_headers = ['FTM', '3PM', '2PM', 'AST']
                var raw_sel = {}
                for (var i = 0; i < raw_data.length; i++) {
                    raw_sel[raw_data[i]["PLAYER"]] = {}

                    for (var j = 0; j < headers.length; j++) {
                        if (init_headers.includes(headers[j])) {
                            raw_sel[raw_data[i]["PLAYER"]][headers[j]] = 1
                        }
                        else {
                            raw_sel[raw_data[i]["PLAYER"]][headers[j]] = 0
                        }
                    }
                }

                this.setState({
                    data: raw_data,
                    sel: raw_sel
                })
            }
            )
    }

    /* This should select all selectable cells in the player's row */
    toggleRow(player) {
        const { handleSelectionChange } = this.props
        const newSelected = Object.assign({}, this.state.selected);
        newSelected[player] = !this.state.selected[player];
        //console.log("p", player)

        var newSel = Object.assign({}, this.state.sel);
        if (newSelected[player]) {
            ["FTM","-FTM","2PM","-2PM","3PM","-3PM","OREB", "DREB", "REB", "AST", "TOV", "STL", "BLK", "PF"].forEach(function (column) {
                newSel[player][column] = 1
                handleSelectionChange(player.split(" ")[1].toLowerCase(), column, 1);
            })
        }
        else {
            ["FTM","-FTM","2PM","-2PM","3PM","-3PM","OREB", "DREB", "REB", "AST", "TOV", "STL", "BLK", "PF"].forEach(function (column) {
                newSel[player][column] = 0
                handleSelectionChange(player.split(" ")[1].toLowerCase(), column, 0);
            })
        }

        this.setState({
            selected: newSelected,
            selectAll: 2,
            sel: newSel
        });
    }

    toggleSelectAll() {
        let newSelected = {};
        const { handleSelectionChange } = this.props

        var newSel = Object.assign({}, this.state.sel);
        
        if (this.state.selectAll === 0) {
            this.state.data.forEach(x => {
                newSelected[x["PLAYER"]] = true;
            });
        }

        this.state.data.forEach(x => {
            var player = x["PLAYER"]
            if (newSelected[player]) {
                ["FTM","-FTM","2PM","-2PM","3PM","-3PM","OREB", "DREB", "REB", "AST", "TOV", "STL", "BLK", "PF"].forEach(function (column) {
                    newSel[player][column] = 1
                    handleSelectionChange(player.split(" ")[1].toLowerCase(), column, 1);
                })
            }
            else {
                ["FTM","-FTM","2PM","-2PM","3PM","-3PM","OREB", "DREB", "REB", "AST", "TOV", "STL", "BLK", "PF"].forEach(function (column) {
                    newSel[player][column] = 0
                    handleSelectionChange(player.split(" ")[1].toLowerCase(), column, 0);
                })
            }
        });
        
        this.setState({
            selected: newSelected,
            selectAll: this.state.selectAll === 0 ? 1 : 0
        });
    }

    toggleCol(column) {

        const { handleSelectionChange } = this.props
        const newSelected = Object.assign({}, this.state.colSelected);
        newSelected[column] = !this.state.colSelected[column];

        var newSel = Object.assign({}, this.state.sel);
        if (newSelected[column]) {
            Object.keys(this.state.sel).forEach(function (player) {
                newSel[player][column] = 1
                handleSelectionChange(player.split(" ")[1].toLowerCase(), column, 1);
            })
        }
        else {
            Object.keys(this.state.sel).forEach(function (player) {
                newSel[player][column] = 0
                handleSelectionChange(player.split(" ")[1].toLowerCase(), column, 0);
            })
        }

        this.setState({
            colSelected: newSelected,
            sel: newSel
        });
    }

    render() {
        const { data, sel } = this.state;

        if (data.length) // make sure data has been loaded
        {
            //console.log("sel",sel)
            const footer = data[data.length - 1]
            const headers = ['PLAYER', 'MIN', 'FTM', '-FTM','FTA', 'FT%','2PM','-2PM','3PM','-3PM','3PA', '3P%','FGM', 'FG%', 'OREB', 'DREB', 'REB', 'AST', 'TOV', 'STL', 'BLK', 'PF', '+/-', 'PTS']
            const column_widths = [200,60,45,50,45,45,45,50,45,50,45,45,50,50,60,60,45,45,45,45,45,45,45,45]
            const accessors = headers
            console.log(column_widths.length,headers.length)

            // For row selection
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

            for (var i = 0; i < headers.length; i++) {
                columns.push(
                    {
                        Header: headers[i],
                        accessor: accessors[i],
                        width: column_widths[i],
                        getProps: (state, rowInfo, column) => {
                            // Left align Player column
                            if (column["Header"] === "PLAYER")
                            {
                                return{
                                style: {
                                    textAlign: 'left'
                                }}
                            }
                            // Gray out columns that are not selectable
                            if (["PLAYER", "MIN","FTA","FG%","3PA","3P%","FT%","FGM","+/-","PTS"].includes(column["Header"]) && rowInfo) {
                                console.log(rowInfo)
                                return {
                                    style: {
                                        background: column["Header"] === "PLAYER" ? null : '#D3D3D3'
                                    }
                                }
                            }
                            // Handle color change on selection
                            else {
                                if (rowInfo && column)
                                {
                                    //console.log(rowInfo.original["PLAYER"])
                                }
                                return {
                                    style: {
                                        background: rowInfo && column && this.state.sel[rowInfo.original["PLAYER"]][column["Header"]] === 1 ? '#ADD8E6' : null,
                                        color: rowInfo && column && this.state.sel[rowInfo.original["PLAYER"]][column["Header"]] === 1 ? 'white' : 'black',
                                    },
                                };
                            }
                        },
                        Footer: (state) => (
                            <div className="test">
                                {(["FTM","-FTM","2PM","-2PM","3PM","-3PM","OREB","DREB","REB","AST","TOV","STL","BLK","PF"].includes(state["column"]["Header"])) ?
                                <input
                                    type="checkbox"
                                    className="checkbox"
                                    checked={this.state.colSelected[state["column"]["Header"]] === true}
                                    onChange={() => this.toggleCol(state["column"]["Header"])}
                                /> : <br></br> }
                                <div><strong>{footer[state["column"]["Header"]]}</strong></div>
                                
                            </div>
                        ),
                    })
            }

            return (
                <div>
                    <p className="tableheader">{this.props.team}</p>
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

                                    // Update the selection matrix
                                    if (rowInfo && rowInfo.row && column && column["Header"]) {
                                        var new_sel = Object.assign({}, this.state.sel);
                                        new_sel[rowInfo.original["PLAYER"]][column["Header"]] = this.state.sel[rowInfo.original["PLAYER"]][column["Header"]] === 0 ? 1 : 0
                                        this.setState({
                                            sel: new_sel
                                        })

                                        // Tell parent component to update the selectionMatrix
                                        this.props.handleSelectionChange(rowInfo.original["PLAYER"].split(" ")[1].toLowerCase(), column["Header"], new_sel[rowInfo.original["PLAYER"]][column["Header"]]);
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

export default BoxScore;

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