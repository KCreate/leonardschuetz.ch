// Dependencies
import React, { Component } from 'react';

class PNGEncoder extends Component {

    constructor(...args) {
        super(...args);
        this.handleChange = this.handleChange.bind(this);

        this.state = {
            src: '',
        };
    }

    handleChange(event) {
        this.setState({
            src: event.target.value,
        });
    }

    render() {
        return (
            <div>
                <img
                    src={'/apps/txt-png?message=' + (this.state.src || 'helloworld')}
                    alt="no-smooth">
                </img>
                <input
                    type="text"
                    onChange={this.handleChange}
                    value={this.state.src}
                    placeholder="Text to encode">
                </input>
            </div>
        );
    }
}

export default PNGEncoder;
