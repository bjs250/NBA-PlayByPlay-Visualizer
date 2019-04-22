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
            
        return (

            <foreignObject x={xScale(hoveredPoint.x)} y={yScale(hoveredPoint.y)-100} width={300} height={100}>
                <div>
                <strong>{hoveredPoint.home+hoveredPoint.visit}</strong>
                </div>
            </foreignObject>
            
        );
    }

}


export default Tooltip;