// Dependencies
import React, { Component, PropTypes } from 'react';
import ProtoController from './ProtoController';
import Header from './Header';
import Content from './Content';
import get from '../../utils/get';

// Router
import {
    Link,
    IndexLink,
} from 'react-router';

class MainController extends ProtoController {

    constructor(...args) {
        super(...args);

        this.state = Object.assign({}, {
            title: 'Leonard Schuetz',
            navigation: [
                ['blog', 'Blog'],
                ['projects', 'Projects'],
                ['about', 'About'],
                ['development', 'Development'],
            ],
            sources: this.props.sources,
            expanded: true,
        });
    }

    getCurrentCards() {

        // Get the current cards
        const cards = this.renderCurrentCards(this.props.route.path.slice(1));

        // If no cards are found on this controller, call the protocontroller
        return cards || super.getCurrentCards();
    }

    render() {
        return (
            <div className="MainController">
                <Header
                    title={this.state.title}
                    navigation={this.state.navigation}
                    expanded={this.state.expanded}
                    writingAnimationFinished={this.writingAnimationFinished}></Header>
                <Content
                    expanded={this.state.expanded}>
                    {this.getCurrentCards()}
                </Content>
            </div>
        );
    }
}

export default MainController;
