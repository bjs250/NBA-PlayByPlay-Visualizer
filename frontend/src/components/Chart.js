import React from 'react';

import * as d3 from 'd3';
//import { axisBottom, axisLeft } from 'd3-axis';
//import { select } from 'd3-selection';

import Scatterplot from './Scatterplot.js'

class Chart extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            data: [],
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
        console.log("Chart mount")
        fetch('http://localhost:8000/games/PBP/0041800104#')
            .then(res => res.json())
            .then(res =>
                this.setState({
                    data: res
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
        console.log("Current selected button: " + this.state.buttonSelected)
        const { data, zoomTransform, buttonSelected } = this.state,
        { width, height, margin } = this.props;
        var scale_factor = 4;

        return (
            <div>
                <div>
                    <svg width={width} height={height} ref="svg">
                        <Scatterplot data={data}
                            x={0} y={0}
                            width={width*scale_factor}
                            height={height}
                            margin={margin}
                            zoomTransform={zoomTransform}
                            zoomType="scale" 
                            buttonSelected={buttonSelected}/>
                    </svg>
                </div>
                <div>
                    <button id="Q1" onClick={this.handleQuarterSubmit}>Q1</button>
                    <button id="Q2" onClick={this.handleQuarterSubmit}>Q2</button>
                    <button id="Q3" onClick={this.handleQuarterSubmit}>Q3</button>
                    <button id="Q4" onClick={this.handleQuarterSubmit}>Q4</button>
                    <button id="Full Game" onClick={this.handleQuarterSubmit}>Full Game</button>
                </div>
            </div>
        );
    }
}

export default Chart;