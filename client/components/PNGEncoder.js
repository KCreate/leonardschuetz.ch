// Dependencies
import React, { Component } from 'react';

class PNGEncoder extends Component {

    constructor(...args) {
        super(...args);
        this.handleChange = this.handleChange.bind(this);

        this.state = {
            src: '',
            inputText: 'helloworld',
        };

        // Debounce input change
        this.debouncedWrite = undefined;
    }

    handleChange(event) {

        this.setState({
            inputText: event.target.value,
        });

        // Cancel if an action is currently being debounced
        if (this.debouncedWrite) {
            clearTimeout(this.debouncedWrite);
            this.debouncedWrite = undefined;
        }

        this.debouncedWrite = setTimeout(() => {
            this.setState({
                src: this.state.inputText,
            });

            this.debouncedWrite = undefined;
        }, 750); // Debounce delay
    }

    render() {
        return (
            <div>
                <img
                    src={'/apps/txt-png?message=' + (this.state.src || 'helloworld')}
                    alt="no-smooth small">
                </img>
                <input
                    type="text"
                    onChange={this.handleChange}
                    value={this.state.inputText}
                    placeholder="Text to encode">
                </input>
            </div>
        );
    }
}

export default PNGEncoder;
