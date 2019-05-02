import React from 'react';
import '../styles/Points.css'

class Test extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { scales, data } = this.props
        const { xScale, yScale } = scales
        return (

            data.map(d => (
                <text 
                    x={xScale(d.x)} 
                    y={yScale(d.y)+3.5} 
                    font-size="10px"
                    text-anchor="middle"
                    fill="white">
                    3
                </text>
            ))

        );
    }

}

export default Test;