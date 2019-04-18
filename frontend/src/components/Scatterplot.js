import React, { Component } from 'react';

import * as d3 from 'd3';
import { axisBottom, axisLeft } from 'd3-axis';
import { select } from 'd3-selection';

class Scatterplot extends React.Component {
    constructor(props) {
      super(props);
      this.updateD3(props);
    }

    componentWillUpdate(nextProps) {
      this.updateD3(nextProps);
    }
    
    updateD3(props) {
      const { data, width, height, zoomTransform, zoomType } = props;
   
      this.xScale = d3.scaleLinear()
                      .domain([0, d3.max(data, ([x, y]) => x)])
                      .range([0, width]);
      this.yScale = d3.scaleLinear()
                      .domain([0, d3.max(data, ([x, y]) => y)])
                      .range([0, height]);
   
      if (zoomTransform && zoomType === "detail") {
        this.xScale.domain(zoomTransform.rescaleX(this.xScale).domain());
        this.yScale.domain(zoomTransform.rescaleY(this.yScale).domain());
      }
    }

    get transform() {
      const { x, y, zoomTransform, zoomType } = this.props;
      let transform = "";
   
      if (zoomTransform && zoomType === "scale") {
        transform = `translate(${x + zoomTransform.x}, ${y + zoomTransform.y}) scale(${zoomTransform.k})`;
      }else{
        transform = `translate(${x}, ${y})`;
      }
   
      return transform;
    }

    render() {
      const { data,width,height } = this.props;

      if (Object.keys(data).length) // make sure data has been loaded
        {
      
            var xdata = Object.values(data["time(seconds)"]);
            var ydata = Object.values(data["score differential"]);

            // Put data into input format for d3.line
            var xy = [];
            for(var i = 0; i < xdata.length; i++ ) {
                xy.push({x: xdata[i], y: ydata[i], key:i});
            }

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
            
            return (
                <g transform={this.transform} ref="scatterplot">
                {xy.map(d => (
                <circle
                  key={d.key}
                  cx={xScale(d.x)}
                  cy={yScale(d.y)}
                  r={3}
                  
                />
              ))}
                </g>
            );
        }

        return (
            <div>Loading...</div>
          );
    }
  }

  export default Scatterplot;