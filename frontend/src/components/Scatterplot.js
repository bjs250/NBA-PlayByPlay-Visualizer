import React from 'react';
import '../styles/Scatterplot.css'

import memoize from "memoize-one";
import * as d3 from 'd3';
import { axisBottom, axisLeft } from 'd3-axis';
import { select } from 'd3-selection';

import Tooltip from './Tooltip.js';
import Points from './Points.js';

class Scatterplot extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hoveredPoint: null,
    }

  }

  // Memoized functions to process data
  line_filter = memoize(
    (line_data, buttonSelected) => line_data.filter(function (d) {
      return d["quarter"] === buttonSelected || buttonSelected === "Full Game";
    }
    ).map(d => ({ x: d["time_seconds"], y: d["score differential"], key: d["key"] }))
  );

  baseline_filter = memoize(
    (line_data, buttonSelected) => line_data.filter(function (d) {
      return d["quarter"] === buttonSelected || buttonSelected === "Full Game";
    }
    ).map(d => ({ x: d["time_seconds"], y: 0, key: d["key"] + 1000 })) //Note: difference in y and key
  );

  point_filter = memoize(
    (selectionMatrix, point_data, buttonSelected) => {
        
      var keyCheck = {}
      var timeCheck = {}

      function helper(selectionMatrix, point_data, player, identifier, keyCheck) {
        if (selectionMatrix[player][identifier] === 1) {
          point_data[player][identifier].forEach(d => {
            if (d["key"] in keyCheck === false) {
              keyCheck[d["key"]] = d
              if (d["time_seconds"] in timeCheck === true) {
                //console.log(timeCheck[d["time_seconds"]])
              }
              timeCheck[d["time_seconds"]] = d
            }
          })
        }
        return keyCheck
      }
      function helper_plus(selectionMatrix, point_data, player, identifier, identifier_plus, keyCheck) {
        if (selectionMatrix[player][identifier][identifier_plus] === 1) {
          point_data[player][identifier][identifier_plus].forEach(d => {
            if (d["key"] in keyCheck === false) {
              keyCheck[d["key"]] = d
              if (d["time_seconds"] in timeCheck === true) {
                //console.log(timeCheck[d["time_seconds"]])
              }
              timeCheck[d["time_seconds"]] = d
            }
          })
        }
        return keyCheck
      }

      Object.keys(point_data).forEach(function (player) {
        keyCheck = helper(selectionMatrix, point_data, player, "AST", keyCheck)
        keyCheck = helper(selectionMatrix, point_data, player, "REB", keyCheck)
        keyCheck = helper(selectionMatrix, point_data, player, "BLK", keyCheck)
        keyCheck = helper(selectionMatrix, point_data, player, "STL", keyCheck)
        keyCheck = helper(selectionMatrix, point_data, player, "TOV", keyCheck)
        keyCheck = helper(selectionMatrix, point_data, player, "FOUL", keyCheck)
        keyCheck = helper_plus(selectionMatrix, point_data, player, "1", "Made", keyCheck)
        keyCheck = helper_plus(selectionMatrix, point_data, player, "2", "Made", keyCheck)
        keyCheck = helper_plus(selectionMatrix, point_data, player, "3", "Made", keyCheck)
        keyCheck = helper_plus(selectionMatrix, point_data, player, "1", "Miss", keyCheck)
        keyCheck = helper_plus(selectionMatrix, point_data, player, "2", "Miss", keyCheck)
        keyCheck = helper_plus(selectionMatrix, point_data, player, "3", "Miss", keyCheck)
      })

      var pruned_xy = Object.values(keyCheck).filter(function (d) {
        return d["quarter"] === buttonSelected || buttonSelected === "Full Game";
      }).map(d => ({ x: d["time_seconds"], y: d["score differential"], text: d["home"] + " " + d["visit"], key: d["key"], tag: d["tag"], color: d["color"] }))


      return pruned_xy
    }
  )

  // For axes and lines
  updateD3 = memoize(
    (xy, new_height, new_width, buttonSelected, yScaleMin, yScaleMax) => {

      // X Scale
      var xScale = d3.scaleLinear()
        .domain(d3.extent(xy, function (d) { return d.x; }))
        .range([0, new_width]);

      var start, end = 0;
      if (buttonSelected === "Full Game") {
        start = 0
        end = 4 * 12 * 60
      }
      else {
        var quarter = parseInt(buttonSelected.charAt(1))
        start = 12 * 60 * (quarter - 1)
        end = start + 12 * 60
      }
      var xticks = d3.range(start, end, 30)

      // Y Scale

      if (yScaleMin !== null && yScaleMax !== null) {
        var extrema = [yScaleMin, yScaleMax]
      }
      else {
        var extrema = d3.extent(xy, function (d) { return d.y; })
        extrema[0] -= 1
        extrema[1] += 1
      }

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


      var guidepoints = null
      var guideline = null
      if (buttonSelected === "Full Game") {

        var guidepoints = []
        var guides = [720, 720 * 2, 720 * 3, 720 * 4]
        var keyStart = 100000
        var counter = 0
        guides.forEach(guide => {

          // Create guideline if necessary
          var guidepoint = [];
          for (var i = extrema[0]; i <= extrema[1]; i++) {
            guidepoint.push({ x: guide, y: i, key: keyStart + counter });
            counter += 1

          }

          guideline = d3.line()
            .x(function (d) { return xScale(d.x); }) // set the x values for the line generator
            .y(function (d) { return yScale(d.y); }) // set the y values for the line generator 

          var holder = { "points": guidepoint, "key": 200000 + counter }
          guidepoints.push(holder)

        })

      }
    
      return [xScale, yScale, line, baseline, xticks, yticks, guidepoints, guideline]

    }
  )

  get ytransform() {
    var { x, zoomTransform, margin } = this.props;
    let transform = "";

    if (zoomTransform) {
      transform = `translate(${x + zoomTransform.x + margin.left}, ${zoomTransform.y}) scale(${zoomTransform.k})`;
    }
    //console.log(this.props.width,x,zoomTransform.x)
    return transform;

  }

  get xtransform() {
    const { x, y, zoomTransform, margin } = this.props;
    let transform = "";

    if (zoomTransform) {
      transform = `translate(${x + margin.left}, ${y + zoomTransform.y}) scale(${zoomTransform.k})`;
    }
    return transform;

  }

  render() {
    const { line_data, point_data, buttonSelected, width, height, margin, selectionMatrix, yScaleMin, yScaleMax } = this.props;
    var { new_width, new_height } = this.state;
    
    if (line_data.length && Object.keys(point_data).length) // make sure line_data has been loaded
    {
      // Use the margin convention practice 
      var new_width = width - margin.left - margin.right // Use the window's width 
      var new_height = height - margin.top - margin.bottom; // Use the window's height

      //Put line_data into input format for d3.line by filtering by quarter (but only if data has changed)
      const xy = this.line_filter(line_data, buttonSelected)
      const baseline_xy = this.baseline_filter(line_data, buttonSelected)

      const pruned_xy = this.point_filter(selectionMatrix, point_data, buttonSelected, JSON.stringify(selectionMatrix))

      // Calculate axes and lines in D3 (but only if data has changed)
      const D3assets = this.updateD3(xy, new_height, new_width, buttonSelected, yScaleMin, yScaleMax)
      const xScale = D3assets[0];
      const yScale = D3assets[1];
      const line = D3assets[2];
      const baseline = D3assets[3];
      const xticks = D3assets[4];
      const yticks = D3assets[5];
      const guidepoints = D3assets[6]
      var guideline = D3assets[7];

      return (
        <g ref="scatterplot" transform={`translate(0, ${5})`}>
          <text transform={`translate(${margin.left / 2}, ${height / 2}) rotate(-90)`}>Point Differential</text>
          <text transform={`translate(${buttonSelected === "Full Game" ? width / (8*this.props.scaleFactor) : width / (2*this.props.scaleFactor)}, ${height - margin.bottom})`}>Time</text>

          <g transform={this.ytransform} id="holder">

            <g
              className="xaxis"
              transform={`translate(0, ${new_height})`}
              ref={node => select(node).call(axisBottom(xScale).tickValues(xticks).tickFormat(d => `${Math.trunc((720 - (d % 720)) / 60)}:${d % 60 === 0 ? "00" : d % 60}`))}
            />

            <path className="line"
              d={line(xy)}
            />

            <path className="baseline"
              d={baseline(baseline_xy)}
            />

            {guideline !== null ?
              guidepoints.map((d) => {
                return <path className="guideline" key={d["key"]}
                  d={guideline(d["points"])}
                />
              }) : null}

            <Points
              scales={{ xScale, yScale }}
              data={pruned_xy}
              onMouseOverCallback={d => this.setState({ hoveredPoint: d })}
              onMouseOutCallback={d => this.setState({ hoveredPoint: null })}
            />

            {this.state.hoveredPoint ?
              <Tooltip
                hoveredPoint={this.state.hoveredPoint}
                scales={{ xScale, yScale }}
              /> :
              null}

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