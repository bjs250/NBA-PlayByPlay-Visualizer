import React, { Component } from 'react';
import axios from "axios";
import * as d3 from 'd3';
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
    
    if (Object.keys(data).length) // make sure data has been loaded
    {
      
      var xdata = data["time"];
      var ydata = data["score differential"];
      var home = data["home"];
      var visit = data["visit"];

      console.log("hit")
      console.log(xdata)

      // Put data into input format for d3.line
      var xy = []; 
      for(var i = 0; i < xdata.length; i++ ) {
        xy.push({x: xdata[i], y: ydata[i], home:home[i], visit:visit[i]});
      }

      var baseline_xy = []; 
      for(var i = 0; i < xdata.length; i++ ) {
          baseline_xy.push({x: xdata[i], y: 0});
      }

      // Use the margin convention practice 
      var margin = {top: 50, right: 50, bottom: 50, left: 50}
      , width = window.innerWidth - margin.left - margin.right // Use the window's width 
      , height = window.innerHeight - margin.top - margin.bottom; // Use the window's height

      // X scale 
      var xScale = d3.scaleLinear()
        .domain(d3.extent(xy, function(d) {return d.x;})) 
        .range([0, width]);

      const xAxis = d3.axisBottom(xScale)
        .tickValues(xy.x)
        .tickFormat(d => moment.utc((15*60-d)*1000).format('mm:ss'))
        .ticks(20)

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

      var baseline = d3.line()
        .x(function(d) { return xScale(d.x); }) // set the x values for the line generator
        .y(function(d) { return yScale(d.y); }) // set the y values for the line generator 

    }

    return (
        <svg 
        width={this.props.size} 
        height={this.props.size} 
        ref={element => (this.svg = d3.select(element))}>
        </svg>
    );
  }

}

export default PBP_Graph;