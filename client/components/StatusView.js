// Dependencies
import React, { Component } from 'react';

class StatusView extends Component {
    render() {

        const className = ({
            success: 'greenText',
            error: 'redText',
            progress: 'blueText',
        })[this.props.status.type];

        return (
            <p className={className}>{this.props.status.text}</p>
        );
    }
}

StatusView.defaultProps = {
    status: {
        text: '',
        type: 'success',
    },
};

export default StatusView;
