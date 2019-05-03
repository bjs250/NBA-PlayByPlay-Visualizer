import React from 'react';
import '../styles/Scatterplot.css'

import * as d3 from 'd3';
import { axisBottom, axisLeft } from 'd3-axis';
import { select } from 'd3-selection';

import Tooltip from './Tooltip.js';
import Points from './Points.js';

class Scatterplot extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hoveredPoint: null
    }

  }

  get transform() {
    const { x, y, zoomTransform, margin } = this.props;
    //console.log("Transform Executed",margin, zoomTransform)
    let transform = "";

    if (zoomTransform) {
      transform = `translate(${x + zoomTransform.x + margin.left}, ${y + zoomTransform.y + margin.top}) scale(${zoomTransform.k})`;
    }

    return transform;
  }

  get ytransform() {
    const { x, y, zoomTransform, margin } = this.props;
    //console.log("Transform Executed",margin, zoomTransform)
    let transform = "";

    if (zoomTransform) {
      transform = `translate(${x + zoomTransform.x + margin.left}, ${zoomTransform.y}) scale(${zoomTransform.k})`;
    }
    return transform;

  }

  get xtransform() {
    const { x, y, zoomTransform, margin } = this.props;
    //console.log("Transform Executed",margin, zoomTransform)
    let transform = "";

    if (zoomTransform) {
      transform = `translate(${x + margin.left}, ${y + zoomTransform.y}) scale(${zoomTransform.k})`;
    }
    return transform;

  }

  render() {
    const { line_data, point_data, width, height, margin, buttonSelected } = this.props;

    if (line_data.length && Object.keys(point_data).length) // make sure line_data has been loaded
    {
      // Use the margin convention practice 
      var new_width = width - margin.left - margin.right // Use the window's width 
      var new_height = height - margin.top - margin.bottom; // Use the window's height

      // Put line_data into input format for d3.line by filtering by quarter
      var xy = line_data.filter(function (d) {
        return d["quarter"] === buttonSelected || buttonSelected === "Full Game";
      }).map(d => ({ x: d["time_seconds"], y: d["score differential"], key: d["key"] }))

      // Render the baseline
      var baseline_xy = line_data.filter(function (d) {
        return d["quarter"] === buttonSelected || buttonSelected === "Full Game";
      }).map(d => ({ x: d["time_seconds"], y: 0, key: d["key"]+1000 }))

      // Render the points
      console.log(point_data)
      var selected_players = ["brown"]
      var selected_interests = ["AST"]
      var set = new Set()
      Object.keys(point_data).forEach(function(player){
        if (selected_players.includes(player)){
          Object.keys(point_data[player]).forEach(function(interest){
            if (selected_interests.includes(interest))
            {
              point_data[player][interest].map(d => set.add(d))
            }
          })
        }
      })
      var pruned_xy = Array.from(set).filter(function (d) {
        return d["quarter"] === buttonSelected || buttonSelected === "Full Game";
      }).map(d => ({ x: d["time_seconds"], y: d["score differential"], key: d["key"]+2000 }))
      console.log(pruned_xy)


      // X Scale
      var xScale = d3.scaleLinear()
        .domain(d3.extent(xy, function (d) { return d.x; }))
        .range([0, new_width]);
      var X_extrema = d3.extent(xy, function (d) { return d.x; })
      var xticks = Math.floor((X_extrema[1] - X_extrema[0]) / 60.0)

      // Y Scale 
      var extrema = d3.extent(xy, function (d) { return d.y; })
      extrema[0] -= 1
      extrema[1] += 1
      var yticks = extrema[1] - extrema[0] + 1

      var yScale = d3.scaleLinear()
        .domain(extrema)
        .range([new_height, 0]);

      // D3 line generator for score differential
      var line = d3.line()
        .x(function (d) { return xScale(d.x); }) // set the x values for the line generator
        .y(function (d) { return yScale(d.y); }) // set the y values for the line generator 
        .curve(d3.curveStepAfter) // apply smoothing to the line

      var baseline = d3.line()
        .x(function (d) { return xScale(d.x); }) // set the x values for the line generator
        .y(function (d) { return yScale(d.y); }) // set the y values for the line generator 

      return (
        <g ref="scatterplot" transform={`translate(0, ${5})`}>

          <g transform={this.ytransform}>

            <g
              className="xaxis"
              transform={`translate(0, ${new_height})`}
              ref={node => select(node).call(axisBottom(xScale).ticks(xticks))}
            />

            <path className="line"
              d={line(xy)}
            />

            <path className="baseline"
              d={baseline(baseline_xy)}
            />

            <Points
              scales={{xScale,yScale}}
              data={pruned_xy}
              onMouseOverCallback={d => this.setState({hoveredPoint: d})}
              onMouseOutCallback={d => this.setState({hoveredPoint: null})}
            />

            {/* { this.state.hoveredPoint ?
              <Tooltip
                hoveredPoint={this.state.hoveredPoint}
                scales={{xScale,yScale}}
              /> :
            null} */}

          </g>

          <g transform={this.xtransform}>
            <g
              className="yaxis"
              transform={`translate(0, 0)`}
              ref={node => select(node).call(axisLeft(yScale).ticks(yticks))}
            />
          </g>

        </g>
      );
    }

    return (
      <div>Loading...</div>
    );
  }
}

export default Scatterplot;