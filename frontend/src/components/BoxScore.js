import React from 'react';

import '../styles/BoxScore.css'

class BoxScore extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            data: [],
        }

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

    createTable = () => {
        const { data } = this.state;
        //MIN	FGM	FGA	FG%	3PM	3PA	3P%	FTM	FTA	FT%	OREB	DREB	REB	AST	TOV	STL	BLK	PF	PTS	+
        const players = Object.values(data["Unnamed: 0"])
        const MIN = Object.values(data["MIN"])
        const FGM = Object.values(data["FGM"])
        const FGPercent = Object.values(data["FG%"])
        const ThreePM = Object.values(data["3PM"])
        const ThreePA = Object.values(data["3PA"])
        const ThreePPercent = Object.values(data["3P%"])
        const FTM = Object.values(data["FTM"])
        const FTA = Object.values(data["FTA"])
        const FTPercent = Object.values(data["FT%"])
        const OREB = Object.values(data["OREB"])
        const DREB = Object.values(data["DREB"])
        const REB = Object.values(data["REB"])
        const AST = Object.values(data["AST"])
        const TOV = Object.values(data["TOV"])
        const STL = Object.values(data["STL"])
        const BLK = Object.values(data["BLK"])
        const PF = Object.values(data["PF"])
        const PTS = Object.values(data["PTS"])
        const PlusMinus = Object.values(data["+/-"])

        let table = []

        // Outer loop to create parent

        for (let i = 0; i < players.length; i++) {
            let children = []
            children.push(<td>{players[i]}</td>)
            if (FGPercent[i] === "") {
                children.push(<td>DNP</td>)
                for (let j = 0; j < 18; j++) {
                    children.push(<td>--</td>)
                }
            }

            else {
                if (MIN[i] === "") {
                    children.push(<td>--</td>)
                }
                else {
                    children.push(<td>{MIN[i]}</td>)
                }
                children.push(<td>{FGM[i]}</td>)
                children.push(<td>{FGPercent[i]}</td>)
                children.push(<td>{ThreePM[i]}</td>)
                children.push(<td>{ThreePA[i]}</td>)
                children.push(<td>{ThreePPercent[i]}</td>)
                children.push(<td>{FTM[i]}</td>)
                children.push(<td>{FTA[i]}</td>)
                children.push(<td>{FTPercent[i]}</td>)
                children.push(<td>{OREB[i]}</td>)
                children.push(<td>{DREB[i]}</td>)
                children.push(<td>{REB[i]}</td>)
                children.push(<td>{AST[i]}</td>)
                children.push(<td>{TOV[i]}</td>)
                children.push(<td>{STL[i]}</td>)
                children.push(<td>{BLK[i]}</td>)
                children.push(<td>{PF[i]}</td>)
                children.push(<td>{PTS[i]}</td>)
                children.push(<td>{PlusMinus[i]}</td>)
            }



            table.push(<tr>{children}</tr>)
            if (players[i].includes("Total")) {
                table.push(<tr><td>(break)</td></tr>)
            }

        }
        return table
    }

    render() {

        const { data } = this.state;

        if (Object.keys(data).length) // make sure data has been loaded
        {

            return (
                <div>
                    <table className="BoxScoreTable">
                        <thead>
                            <tr>
                                <th>Players</th>
                                <th>MIN</th>
                                <th>FGM</th>
                                <th>FG%</th>
                                <th>3PM</th>
                                <th>3PA</th>
                                <th>3P%</th>
                                <th>FTM</th>
                                <th>FTA</th>
                                <th>FT%</th>
                                <th>OREB</th>
                                <th>DREB</th>
                                <th>REB</th>
                                <th>AST</th>
                                <th>TOV</th>
                                <th>STL</th>
                                <th>BLK</th>
                                <th>PF</th>
                                <th>PTS</th>
                                <th>+/-</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.createTable()}
                        </tbody>
                    </table>

                </div>
            );
        }

        return (
            <div>Loading...</div>
        );

    }
}

export default BoxScore;