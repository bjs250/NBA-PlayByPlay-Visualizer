import React, { Component } from 'react';
import axios from "axios";
import * as d3 from 'd3';

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