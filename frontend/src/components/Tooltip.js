import React from 'react';
import '../styles/Tooltip.css'

class Tooltip extends React.Component {
    
    render() {
        const { hoveredPoint, scales } = this.props
        const { xScale, yScale } = scales
        // const styles = {
        //   left: `${xScale(hoveredPoint.x) - 30}px`,
        //   top: `${yScale(hoveredPoint.y)}px`
        // }
        
        const height = 100
        const width = 300

        return (

            <foreignObject x={xScale(hoveredPoint.x)-width/2} y={yScale(hoveredPoint.y)-height/2} width={width} height={height} className="tipContainer">
                <div className="tooltip">
                    <strong>{hoveredPoint.text}</strong>
                </div>
            </foreignObject>
            
        );
    }

}


export default Tooltip;