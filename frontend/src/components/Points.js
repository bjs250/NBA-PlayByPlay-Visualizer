import React from 'react';
import '../styles/Points.css'

class Points extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { scales, data} = this.props
        const { xScale, yScale } = scales
        return (

            data.map(d => (

                <circle className="pdot"
                    key={d.key}
                    cx={xScale(d.x)}
                    cy={yScale(d.y)}
                    r={4}
                    onMouseOver={() => this.props.onMouseOverCallback(d)}
                    onMouseOut={() => this.props.onMouseOutCallback(null)}
                />
            ))

      );
    }

}

export default Points;

