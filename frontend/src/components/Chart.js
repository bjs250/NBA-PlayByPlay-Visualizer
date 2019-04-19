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
        }

        this.zoom = d3.zoom()
            .scaleExtent([0, 5])
            .translateExtent([[0, 0], [5000 , props.height ]])
            .extent([[0, 0], [props.width, props.height]])
            .on("zoom", this.zoomed.bind(this))
    }

    componentDidMount() {
        console.log("Chart mount")
        fetch('http://localhost:8000/games/0021800934#')
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

    render() {
        const { zoomTransform } = this.state,
        { width, height, margin } = this.props;
        var scale_factor = 4;

        return (
            <svg width={width} height={height} ref="svg">
                <Scatterplot data={this.state.data}
                    x={0} y={0}
                    width={width*scale_factor}
                    height={height}
                    margin={margin}
                    zoomTransform={zoomTransform}
                    zoomType="scale" />
            </svg>
        );
    }
}

export default Chart;