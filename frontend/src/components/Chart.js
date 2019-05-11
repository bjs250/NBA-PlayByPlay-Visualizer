import React from 'react';

import * as d3 from 'd3';
import axios from "axios";
import memoize from "memoize-one";

import '../styles/Chart.css'
import Scatterplot from './Scatterplot.js'

class Chart extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            line_data: [],
            point_data: [],
            zoomTransform: { k: 1, x: 0, y: 0 },
            buttonSelected: "Full Game",
            temp_yScaleMin: null,
            temp_yScaleMax: null,
            yScaleMin: null,
            yScaleMax: null,
            scaleFactor: 4,
        }

        this.zoom = d3.zoom()
            .scaleExtent([0, 5])
            .translateExtent([[0, 0], [5000, props.height]])
            .extent([[0, 0], [props.width, props.height]])
            .on("zoom", this.zoomed.bind(this))

        this.handleQuarterSubmit = this.handleQuarterSubmit.bind(this);

        this.handleYScaleRefresh = this.handleYScaleRefresh.bind(this);
        this.handleYScaleReset = this.handleYScaleReset.bind(this);
        this.handleYScaleMin = this.handleYScaleMin.bind(this);
        this.handleYScaleMax = this.handleYScaleMax.bind(this);

        this.handleXSpacingPlus = this.handleXSpacingPlus.bind(this);
        this.handleXSpacingMinus = this.handleXSpacingMinus.bind(this);

        this.handleZoomPlus = this.handleZoomPlus.bind(this);
        this.handleZoomMinus = this.handleZoomMinus.bind(this);
    }

    componentDidMount() {
        d3.select(this.refs.svg)
        .call(this.zoom)

    }

    componentDidUpdate() {
        d3.select(this.refs.svg)
        .call(this.zoom)
    }

    load_data = memoize(
        (game_id) => {

            axios.get('games/PBP/line/' + game_id + '#')
                .then(res => res.data)
                .then(res =>
                    this.setState({
                        line_data: res,
                        loadFlag: 0
                    })
                )

            axios.get('games/PBP/data/' + game_id + '#')
                .then(res => res.data)
                .then(res =>
                    this.setState({
                        point_data: res
                    })
                )
    
        }
    )

    zoomed() {
        // console.log(d3.event.sourceEvent["deltaY"],this.state.zoomTransform["k"])
        // if (this.state.zoomTransform["k"] > 2.50)
        // {
        //     if (d3.event.sourceEvent["deltaY"]>=0)
        //     {
        //         this.setState({
        //             zoomTransform: d3.event.transform,
        //         });
        //     }
        // }
        // else{
        //     this.setState({
        //         zoomTransform: d3.event.transform,
        //     });
        // }
        this.setState({
            zoomTransform: d3.event.transform,
        });
    }

    // Change what button is selected
    handleQuarterSubmit = (event) => {
        event.preventDefault();
        var new_zoomTransform = this.state.zoomTransform
        var new_buttonSelected = event.target.id
        new_zoomTransform["x"] = 0
        new_zoomTransform["y"] = 0
        new_zoomTransform["k"] = 1

        this.setState({
            buttonSelected: new_buttonSelected,
            zoomTransform: new_zoomTransform,
            scaleFactor: (new_buttonSelected === "Full Game" ? 4 : 1)
        })
    };

    // For changing the y axis scale
    handleYScaleMin = (event) => {
        this.setState({ temp_yScaleMin: event.target.value })
    }

    handleYScaleMax = (event) => {
        this.setState({ temp_yScaleMax: event.target.value })
    }

    handleYScaleRefresh = (event) => {
        event.preventDefault();
        const { temp_yScaleMin, temp_yScaleMax } = this.state
        var new_yScaleMin = null
        var new_yScaleMax = null

        if (Number.isInteger(parseInt(temp_yScaleMin))) {
            new_yScaleMin = parseInt(temp_yScaleMin)
        }

        if (Number.isInteger(parseInt(temp_yScaleMax))) {
            new_yScaleMax = parseInt(temp_yScaleMax)
        }
        
        console.log("Hit",new_yScaleMin,new_yScaleMax);

        if (new_yScaleMin !== null && new_yScaleMax !== null){
            this.setState({ 
                yScaleMin: new_yScaleMin,
                yScaleMax: new_yScaleMax,
             })
        }

    };

    handleYScaleReset = (event) => {
        event.preventDefault();
        this.setState({ 
            yScaleMin: null,
            yScaleMax: null,
         })
    }

    // For changing the X Axis Scale
    handleXSpacingPlus = (event) => {
        event.preventDefault();
        var new_scaleFactor = this.state.scaleFactor
        if (new_scaleFactor > 1){
            new_scaleFactor += 1
        }
        else{
            new_scaleFactor *= 2
        }
        this.setState({ 
            scaleFactor: new_scaleFactor
         })
    };

    handleXSpacingMinus = (event) => {
        event.preventDefault();
        var new_scaleFactor = this.state.scaleFactor
        if (new_scaleFactor > 1){
            new_scaleFactor -= 1
        }
        else{
            new_scaleFactor *= 0.5
        }
        this.setState({ 
            scaleFactor: new_scaleFactor
         })
    };

    handleZoomPlus = (event) => {
        event.preventDefault();
        console.log("handleZoomPlus");
    };

    handleZoomMinus = (event) => {
        event.preventDefault();
        console.log("handleZoomMinus");
    };

    render() {
        this.load_data(this.props.game_id)
        
        const { line_data, point_data, zoomTransform, buttonSelected, yScaleMin, yScaleMax, scaleFactor } = this.state;
        const { width, height, margin, selectionMatrix, game_id } = this.props;

        return (
            <div>
                <div>
                    <svg width={width} height={height} ref="svg" className="plotholder">
                        <Scatterplot
                            line_data={line_data}
                            point_data={point_data}
                            x={0} y={0}
                            width={width * scaleFactor}
                            height={height}
                            margin={margin}
                            zoomTransform={zoomTransform}
                            buttonSelected={buttonSelected}
                            selectionMatrix={selectionMatrix}
                            yScaleMin={yScaleMin}
                            yScaleMax={yScaleMax}
                            game_id={game_id}
                        />
                    </svg>
                </div>

                <div className="container">
                    <div className="row">
                        <div className="col-4">
                            <div className="quarterHolder">
                                <p>Select Quarter:</p>
                                <button id="Q1" onClick={this.handleQuarterSubmit} className={buttonSelected === "Q1" ? "selected" : "unselected"}>Q1</button>
                                <button id="Q2" onClick={this.handleQuarterSubmit} className={buttonSelected === "Q2" ? "selected" : "unselected"}>Q2</button>
                                <button id="Q3" onClick={this.handleQuarterSubmit} className={buttonSelected === "Q3" ? "selected" : "unselected"}>Q3</button>
                                <button id="Q4" onClick={this.handleQuarterSubmit} className={buttonSelected === "Q4" ? "selected" : "unselected"}>Q4</button>
                                <button id="Full Game" onClick={this.handleQuarterSubmit} className={buttonSelected === "Full Game" ? "selected" : "unselected"}>Full Game</button>
                            </div>
                        </div>
                        <div className="col-8">
                            <div className="row">

                                <div className="col">
                                    <p>Y-Scale:</p>
                                    <label>Min:</label>
                                    <input type="text" onChange={this.handleYScaleMin}></input>
                                    <br></br>
                                    <label>Max:</label>
                                    <input type="text" onChange={this.handleYScaleMax}></input>
                                    <br></br>
                                    <button onClick={this.handleYScaleRefresh}>Refresh</button>
                                    <button onClick={this.handleYScaleReset}>Reset</button>

                                </div>

                                <div className="col">
                                    <p>X-Axis Spacing:</p>
                                    <button id="xdecrease" onClick={this.handleXSpacingMinus}>-</button>
                                    <button id="xincrease" onClick={this.handleXSpacingPlus}>+</button>
                                </div>

                                {/* <div className="col">
                                    <p>Zoom:</p>
                                    <button id="xdecrease" onClick={this.handleZoomMinus}>-</button>
                                    <button id="xincrease" onClick={this.handleZoomPlus}>+</button>
                                </div> */}

                            </div>
                        </div>
                    </div>


                </div>


            </div>
            );
    }
}

export default Chart;
