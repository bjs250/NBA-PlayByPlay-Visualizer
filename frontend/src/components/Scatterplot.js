import React from 'react';

import * as d3 from 'd3';
import { axisBottom, axisLeft } from 'd3-axis';
import { select } from 'd3-selection';

class Scatterplot extends React.Component {
  constructor(props) {
    super(props);
    this.updateD3(props);
  }

  componentDidMount() {
    console.log("Plot mounted")
  }

  componentWillUpdate(nextProps) {
    this.updateD3(nextProps);
  }

  updateD3(props) {
    const { data, width, height, zoomTransform, zoomType, margin } = props;
    console.log("Update executed", width,height,margin)
    
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
    console.log("Transform Executed",margin, zoomTransform)
    let transform = "";

    if (zoomTransform && zoomType === "scale") {
      transform = `translate(${x + zoomTransform.x + margin.left}, ${y + zoomTransform.y + margin.top}) scale(${zoomTransform.k})`;
    } else {
      transform = `translate(${x}, ${y})`;
    }
    return transform;
  }

  render() {
    const { data, width, height, margin } = this.props;
    
    if (Object.keys(data).length) // make sure data has been loaded
    {
      console.log("Render Good Path")
      // Use the margin convention practice 
      var new_width = width - margin.left - margin.right // Use the window's width 
      var new_height = height - margin.top - margin.bottom; // Use the window's height

      var xdata = Object.values(data["time(seconds)"]);
      var ydata = Object.values(data["score differential"]);

      // Put data into input format for d3.line
      var xy = [];
      for (var i = 0; i < xdata.length; i++) {
        xy.push({ x: xdata[i], y: ydata[i], key: i });
      }

      var xScale = d3.scaleLinear()
        .domain(d3.extent(xy, function (d) { return d.x; }))
        .range([0, new_width]);

      // Y scale 
      var extrema = d3.extent(xy, function (d) { return d.y; })
      extrema[0] -= 1
      extrema[1] += 1

      var yScale = d3.scaleLinear()
        .domain(extrema)
        .range([new_height, 0]);
      
      // D3's line generator
      var line = d3.line()
      .x(function(d) { return xScale(d.x); }) // set the x values for the line generator
      .y(function(d) { return yScale(d.y); }) // set the y values for the line generator 
      .curve(d3.curveStepAfter) // apply smoothing to the line

      return (
        <g transform={this.transform} ref="scatterplot">
          <g
            className="x axis"
            transform={`translate(0, ${new_height})`}
            ref={node => select(node).call(axisBottom(xScale).ticks(10))}
          />
          <g
            className="y axis"
            transform={`translate(0, 0)`}
            ref={node => select(node).call(axisLeft(yScale))}
          />
          <path className="line"
                d={line(xy)}
              />
          {xy.map(d => (
            <circle className="pdot"
              key={d.key}
              cx={xScale(d.x)}
              cy={yScale(d.y)}
              r={3}
            />
          ))}
        </g>
      );
    }

    console.log("Render Bad path")
    return (
      <div>Loading...</div>
    );
  }
}

export default Scatterplot;