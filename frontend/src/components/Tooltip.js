import React from 'react';
import './Scatterplot.css'
import * as d3 from 'd3';

class Tooltip extends React.Component {
    constructor(props) {
        super(props);

    }

    render() {
        const { hoveredPoint, scales } = this.props
        const { xScale, yScale } = scales
        const styles = {
          left: `${xScale(hoveredPoint.x) - 30}px`,
          top: `${yScale(hoveredPoint.y)}px`
        }

        console.log(hoveredPoint)
            
        const height = 100
        const width = 300

        return (

            <foreignObject x={xScale(hoveredPoint.x)-width/2} y={yScale(hoveredPoint.y)-height/2} width={width} height={height} className ="tipContainer">
                <div className="tooltip">
                    <strong>{hoveredPoint.home+hoveredPoint.visit}</strong>
                </div>
            </foreignObject>
            
        );
    }

}


export default Tooltip;