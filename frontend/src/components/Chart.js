import React from 'react';

import * as d3 from 'd3';

import '../styles/Chart.css'
import Scatterplot from './Scatterplot.js'

class Chart extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            line_data: [],
            point_data: [],
            zoomTransform: {k:1, x:0, y:0},
            buttonSelected: "Full Game",
        }

        this.zoom = d3.zoom()
            .scaleExtent([0, 5])
            .translateExtent([[0, 0], [5000 , props.height ]])
            .extent([[0, 0], [props.width, props.height]])
            .on("zoom", this.zoomed.bind(this))

        this.handleQuarterSubmit = this.handleQuarterSubmit.bind(this);
    }

    componentDidMount() {
        console.log("Chart mounted ")
        fetch('http://localhost:8000/games/PBP/line/0041800104#')
            .then(res => res.json())
            .then(res =>
                this.setState({
                    line_data: res
                })
            )
        fetch('http://localhost:8000/games/PBP/data/0041800104#')
            .then(res => res.json())
            .then(res =>
                this.setState({
                    point_data: res
                })
            )

        d3.select(this.refs.svg)
            .call(this.zoom)
    }

    componentDidUpdate() {
        d3.select(this.refs.svg)
            .call(this.zoom)
    }

    zoomed() {
        this.setState({
            zoomTransform: d3.event.transform
        });
    }

    // Change what button is selected
    handleQuarterSubmit = (event) => {
        event.preventDefault();
        this.setState({buttonSelected: event.target.id})
    };

    render() {
        const { line_data, point_data, zoomTransform, buttonSelected } = this.state,
        { width, height, margin, selectionMatrix } = this.props;
        var scale_factor = null;
        if (buttonSelected === "Full Game")
        {
            scale_factor = 4;
        }
        else{
            scale_factor = 1;
        }

        
        return (
            <div>
                <div>
                    <svg width={width} height={height} ref="svg">
                        <Scatterplot 
                            line_data={line_data}
                            point_data={point_data}
                            x={0} y={0}
                            width={width*scale_factor}
                            height={height}
                            margin={margin}
                            zoomTransform={zoomTransform}
                            buttonSelected={buttonSelected}
                            selectionMatrix={selectionMatrix}
                            />
                    </svg>
                </div>
                <div>
                    <button id="Q1" onClick={this.handleQuarterSubmit} className={buttonSelected === "Q1" ? "selected" : "unselected"}>Q1</button>
                    <button id="Q2" onClick={this.handleQuarterSubmit} className={buttonSelected === "Q2" ? "selected" : "unselected"}>Q2</button>
                    <button id="Q3" onClick={this.handleQuarterSubmit} className={buttonSelected === "Q3" ? "selected" : "unselected"}>Q3</button>
                    <button id="Q4" onClick={this.handleQuarterSubmit} className={buttonSelected === "Q4" ? "selected" : "unselected"}>Q4</button>
                    <button id="Full Game" onClick={this.handleQuarterSubmit} className={buttonSelected==="Full Game" ? "selected" : "unselected"}>Full Game</button>
                </div>
            </div>
        );
    }
}

export default Chart;