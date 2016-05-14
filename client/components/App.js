// Dependencies
import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import actions from '../redux/actions';
import constants from '../redux/constants';

import './App.scss';
import './../style/master.scss';
class App extends Component {
    render() {
        return (
            <div className="App">
                {React.Children.map(this.props.children, (child, index) => (React.cloneElement(child, {
                    actions: this.props.actions,
                    sources: this.props.sources,
                })))}
            </div>
        );
    }
}

function bindStateToProps(state) {
    return state;
}
function bindActionsToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch),
    };
}

export default connect(
    bindStateToProps,
    bindActionsToProps
)(App);
