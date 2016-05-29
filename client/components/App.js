// Dependencies
import React, { Component, PropTypes } from 'react';

import './../style/App.scss';
class App extends Component {
    render() {
        return (
            <div className="App">
                {this.props.children}
            </div>
        );
    }
}

export default App;
