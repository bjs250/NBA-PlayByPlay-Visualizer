import React from 'react';
import '../styles/Points.css'

class Points extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { scales, data} = this.props
        const { xScale, yScale } = scales
        console.log("points",data)
        return (

            data.map(d => (
                <svg className="test"
                    onMouseOver={() => this.props.onMouseOverCallback(d)}
                    onMouseOut={() => this.props.onMouseOutCallback(null)}
                    key={d.key}
                    >
                    <circle className="pdot"
                        cx={xScale(d.x)}
                        cy={yScale(d.y)}
                        r={5}
                        >
                    </circle>
                    <text
                        x={xScale(d.x)}
                        y={yScale(d.y)+3}
                        fill="black"
                        fontSize="8px"
                        textAnchor="middle"
                        fontWeight="bold"
                        >2
                    </text>
                    
                </svg>
            ))

      );
    }

}

export default Points;