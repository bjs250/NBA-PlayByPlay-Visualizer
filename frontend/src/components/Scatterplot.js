import React from 'react';
import './Scatterplot.css'

import * as d3 from 'd3';
import { axisBottom, axisLeft } from 'd3-axis';
import { select } from 'd3-selection';

import Tooltip from './Tooltip.js';
import Points from './Points.js';

class Scatterplot extends React.Component {
  constructor(props) {
    super(props);
    this.updateD3(props);

    this.state = {
      hoveredPoint: null
    }

  }

  componentWillUpdate(nextProps) {
    this.updateD3(nextProps);
  }

  updateD3(props) {
    const { data, width, height, zoomTransform, zoomType, margin } = props;
    //console.log("Update executed", width,height,margin)

    this.xScale = d3.scaleLinear()
      .domain([0, d3.max(data, ([x, y]) => x)])
      .range([0, width - margin.left - margin.right]);
    this.yScale = d3.scaleLinear()
      .domain([0, d3.max(data, ([x, y]) => y)])
      .range([0, height - margin.top - margin.bottom]);

    if (zoomTransform && zoomType === "detail") {
      this.xScale.domain(zoomTransform.rescaleX(this.xScale).domain());
      this.yScale.domain(zoomTransform.rescaleY(this.yScale).domain());
    }
  }

  get transform() {
    const { x, y, zoomTransform, zoomType, margin } = this.props;
    //console.log("Transform Executed",margin, zoomTransform)
    let transform = "";

    if (zoomTransform && zoomType === "scale") {
      transform = `translate(${x + zoomTransform.x + margin.left}, ${y + zoomTransform.y + margin.top}) scale(${zoomTransform.k})`;
    }

    return transform;
  }

  get ytransform() {
    const { x, y, zoomTransform, zoomType, margin } = this.props;
    //console.log("Transform Executed",margin, zoomTransform)
    let transform = "";

    if (zoomTransform && zoomType === "scale") {
      transform = `translate(${x + zoomTransform.x + margin.left}, ${zoomTransform.y}) scale(${zoomTransform.k})`;
    }
    return transform;

  }

  get xtransform() {
    const { x, y, zoomTransform, zoomType, margin } = this.props;
    //console.log("Transform Executed",margin, zoomTransform)
    let transform = "";

    if (zoomTransform && zoomType === "scale") {
      transform = `translate(${x + margin.left}, ${y + zoomTransform.y}) scale(${zoomTransform.k})`;
    }
    return transform;

  }

  render() {
    const { data, width, height, margin } = this.props;

    if (Object.keys(data).length) // make sure data has been loaded
    {
      // Use the margin convention practice 
      var new_width = width - margin.left - margin.right // Use the window's width 
      var new_height = height - margin.top - margin.bottom; // Use the window's height

      var xdata = Object.values(data["time(seconds)"]);
      var ydata = Object.values(data["score differential"]);
      var home = Object.values(data["home"]);
      var visit = Object.values(data["visit"]);

      // Put data into input format for d3.line
      var xy = [];
      for (var i = 0; i < xdata.length; i++) {
        xy.push({ x: xdata[i], y: ydata[i], key:i });
      }

      var baseline_xy = [];
      for (var i = 0; i < xdata.length; i++) {
        baseline_xy.push({ x: xdata[i], y: 0 });
      }

      var pruned_xy = []; 
      for(var i = 1; i < xdata.length; i++ ) {
          if (ydata[i] !== ydata[i-1]){
              pruned_xy.push({x: xdata[i], y: ydata[i], home:home[i], visit:visit[i], key:i});
          }
      }

      // Try to extract per player information
      /*
      var playerData = [];
      var playerDataDict = {}
      var currentVisitInfo = "";  
      var currentHomeInfo = "";

      for(var i = 0; i < data.length; i++ ) {
          currentPlayer = data[i].players.split(" ")[1].toLowerCase()
          playerDataDict[currentPlayer] = {"info": [], "time": [], "y":[]}
          for(var j = 0; j < xdata.length; j++ ) {
              currentInfo = ""
              currentVisitInfo = visit[j].toLowerCase()
              if (currentVisitInfo.includes(currentPlayer))
              {
                  currentInfo += currentVisitInfo
              }
              currentInfo += " "
              currentHomeInfo = home[j].toLowerCase()
              if (currentHomeInfo.includes(currentPlayer))
              {
                  currentInfo += currentHomeInfo
              }
              if (currentInfo !== " ")
              {
                  playerDataDict[currentPlayer]["time"].push(xdata[j])
                  playerDataDict[currentPlayer]["y"].push(ydata[j])

                  playerDataDict[currentPlayer]["info"].push(home[j] + visit[j])
              }   
          }
      } 

      currentPlayer = "james"
      var player_xy = []; 
      for(var i = 1; i < playerDataDict[currentPlayer]["time"].length; i++ ) {
          player_xy.push({x: playerDataDict[currentPlayer]["time"][i], y: playerDataDict[currentPlayer]["y"][i], info: playerDataDict[currentPlayer]["info"][i]});
          }
      */

      // X Scale
      var xScale = d3.scaleLinear()
        .domain(d3.extent(xy, function (d) { return d.x; }))
        .range([0, new_width]);

      // Y Scale 
      var extrema = d3.extent(xy, function (d) { return d.y; })
      extrema[0] -= 1
      extrema[1] += 1

      var yScale = d3.scaleLinear()
        .domain(extrema)
        .range([new_height, 0]);

      // D3 line generator for score differential
      var line = d3.line()
        .x(function (d) { return xScale(d.x); }) // set the x values for the line generator
        .y(function (d) { return yScale(d.y); }) // set the y values for the line generator 
        .curve(d3.curveStepAfter) // apply smoothing to the line

      var baseline = d3.line()
      .x(function(d) { return xScale(d.x); }) // set the x values for the line generator
      .y(function(d) { return yScale(d.y); }) // set the y values for the line generator 

      return (
        <g ref="scatterplot">

          <g transform={this.ytransform}>

            <g
              className="xaxis"
              transform={`translate(0, ${new_height})`}
              ref={node => select(node).call(axisBottom(xScale).ticks(10))}
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

            { this.state.hoveredPoint ?
              <Tooltip
                hoveredPoint={this.state.hoveredPoint}
                scales={{xScale,yScale}}
              /> :
            null}

          </g>

          <g transform={this.xtransform}>
            <g
              className="yaxis"
              transform={`translate(0, 0)`}
              ref={node => select(node).call(axisLeft(yScale).ticks(20))}
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