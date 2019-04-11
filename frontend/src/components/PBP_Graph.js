import React, { Component } from 'react';
import axios from "axios";

import * as d3 from 'd3';
//import { scaleBand, scaleLinear } from 'd3-scale';
import { max } from 'd3-array';
import { axisBottom, axisLeft } from 'd3-axis';
import { select } from 'd3-selection';

import moment from 'moment';

class PBP_Graph extends Component {
  constructor(props) {
    super(props);

    // Initialize state here
    this.state = {
        data: []
    };

    // Bind event listening methods here

  }

  componentDidMount()
  {
      fetch('http://localhost:8000/games/0021800934#')
      .then(res => res.json())
      .then(res => 
        this.setState({
          data: res
        })
      )

  }

  render() {
    let { data } = this.state;

    // Use the margin convention practice 
    var margin = {top: 50, right: 50, bottom: 50, left: 50}
    , width = window.innerWidth - margin.left - margin.right // Use the window's width 
    , height = window.innerHeight - margin.top - margin.bottom; // Use the window's height
    
    if (Object.keys(data).length) // make sure data has been loaded
    {
      var xdata = Object.values(data["time(seconds)"]);
      var ydata = Object.values(data["score differential"]);


      console.log("hit")
      console.log("xdata",xdata, xdata.length)

      // Put data into input format for d3.line
      var xy = [];
      for(var i = 0; i < xdata.length; i++ ) {
        xy.push({x: xdata[i], y: ydata[i]});
      }

      console.log("xy",xy)
      console.log("xy.x",xy[10].x)
      console.log("xy.y",xy[10].y)

      // X scale 
      var xScale = d3.scaleLinear()
        .domain(d3.extent(xy, function(d) {return d.x;})) 
        .range([0, width]);

      // Y scale 
      var extrema = d3.extent(xy, function(d) {return d.y;})
      extrema[0] -= 1
      extrema[1] += 1

      var yScale = d3.scaleLinear()
        .domain(extrema)
        .range([height, 0]); 

      // d3's line generator
      var line = d3.line()
        .x(function(d) { return xScale(d.x); }) // set the x values for the line generator
        .y(function(d) { return yScale(d.y); }) // set the y values for the line generator 
        .curve(d3.curveStepAfter) // apply smoothing to the line

      console.log("line",line(xy))

        return (
          <svg 
            width={this.props.width} 
            height={this.props.height}>
            <g 
              >
              <g
                className="x axis"
                transform={`translate(0, ${height})`}
                ref={node => select(node).call(axisBottom(xScale).ticks(1))}
              />
              <g
                className="y axis"
                ref={node => select(node).call(axisLeft(yScale))}
              />
            </g>
            <g className="line">
              <path
                d={line(xy)}
                fill={"none"}
                stroke={"#000000"}
                stroke-width={"3"}>
              </path>
            </g>
  
          </svg>
      );

    }

    return (
      <div>Loading...</div>
    );


  }

}

export default PBP_Graph;