import React from 'react';
import '../styles/Points.css'

class Points extends React.Component {
 
    render() {
        const { scales, data} = this.props
        const { xScale, yScale } = scales

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
                        stroke={d["color"]}
                        >
                    </circle>
                    <text
                        x={xScale(d.x)}
                        y={yScale(d.y)+2}
                        fill="black"
                        fontSize="6px"
                        textAnchor="middle"
                        fontWeight="bold"
                        >{d.tag}
                    </text>
                    
                </svg>
            ))

      );
    }

}

export default Points;