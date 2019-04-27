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
        table.push(<tr>
            <td>Players</td>
            <td>MIN</td>
            <td>FGM</td>
            <td>FG%</td>
            <td>3PM</td>
            <td>3PA</td>
            <td>3P%</td>
            <td>FTM</td>
            <td>FTA</td>
            <td>FT%</td>
            <td>OREB</td>
            <td>DREB</td>
            <td>REB</td>
            <td>AST</td>
            <td>TOV</td>
            <td>STL</td>
            <td>BLK</td>
            <td>PF</td>
            <td>PTS</td>
            <td>+/-</td>

        </tr>)

    
        // Outer loop to create parent

        for (let i = 0; i < players.length; i++) {
          let children = []
          children.push(<td>{players[i]}</td>)
          children.push(<td>{MIN[i]}</td>)
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

          table.push(<tr>{children}</tr>)
        }
        return table
      }

    render() {

        const { data } = this.state;
        
        if (Object.keys(data).length) // make sure data has been loaded
        {
            const players = Object.values(data["Unnamed: 0"])
            const FGA = Object.values(data["FGA"])

            return (
                <div>
                    <p>Box Score</p>

                    <table className="BoxScoreTable">
                        {this.createTable()}
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