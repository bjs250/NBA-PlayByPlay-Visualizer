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

    render() {

        const { data } = this.state;
        
        if (Object.keys(data).length) // make sure data has been loaded
        {
            const players = Object.values(data["players"])

            console.log(players)
            return (
                <div>
                    <table className="BoxScoreTable">
                        <tr>
                            <td><strong>Player</strong></td>
                        </tr>
                        {players.map(d => (
                        <tr>
                            <td>{d}</td>
                        </tr>
                        ))}
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