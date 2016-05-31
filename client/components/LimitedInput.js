// Dependencies
import React, { Component, PropTypes } from 'react';

import '../style/LimitedInput.scss';
class LimitedInput extends Component {

    constructor(...args) {
        super(...args);

        this.onchange = this.onchange.bind(this);
        this.state = {
            value: '',
        };
    }

    onchange(event) {
        this.setState({
            value: event.target.value.slice(0, this.props.maxlength),
        });
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            value: '',
        });
    }

    render() {
        return (
            <div className="LimitedInput">
                <input
                    type="text"
                    value={this.state.value}
                    onChange={this.onchange}
                    placeholder={this.props.placeholder}></input>
                <span>
                    {(this.props.maxlength - this.state.value.length)}
                </span>
            </div>
        );
    }
}

export default LimitedInput;
