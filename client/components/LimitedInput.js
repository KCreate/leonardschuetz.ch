// Dependencies
import React, { Component } from "react";

import "../style/LimitedInput.scss";
class LimitedInput extends Component {

    constructor(...args) {
        super(...args);
        this.onchange = this.onchange.bind(this);
    }

    onchange(event) {
        this.props.onChange(event.target.value.slice(0, this.props.maxlength));
    }

    render() {
        return (
            <div className="LimitedInput">
                <input
                    type="text"
                    value={this.props.value}
                    onChange={this.onchange}
                    placeholder={this.props.placeholder}></input>
                <span>
                    {(this.props.maxlength - this.props.value.length)}
                </span>
            </div>
        );
    }
}

export default LimitedInput;
