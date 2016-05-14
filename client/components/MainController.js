// Dependencies
import React, { Component, PropTypes } from 'react';
import ProtoController from './ProtoController';
import Header from './Header';
import Content from './Content';
import Card from './Card';
import get from '../../utils/get';

// Router
import {
    Link,
    IndexLink,
} from 'react-router';

class MainController extends ProtoController {

    constructor(...args) {
        super(...args);
        this.getCurrentCards = this.getCurrentCards.bind(this);
        this.writingAnimationFinished = this.writingAnimationFinished.bind(this);

        this.state = Object.assign({}, {
            title: 'Leonard Schuetz',
            navigation: [
                ['blog', 'Blog'],
                ['projects', 'Projects'],
                ['about', 'About'],
            ],
            expanded: true,
        }, this.props.sources);
    }

    // Text writing animation
    componentDidMount() {
        this.initialDataLoadForSource('blog');
        this.initialDataLoadForSource('projects');
        this.initialDataLoadForSource('about');
    }

    writingAnimationFinished(event) {
        this.setState({
            expanded: false,
        });
    }

    getCurrentCards() {

        // Select the right function from the object
        const cards = ({
            '/blog': this.renderCurrentCards('blog'),
            '/projects': this.renderCurrentCards('projects'),
            '/about': this.renderCurrentCards('about'),
        })[this.props.route.path];

        // If no cards were found
        if (!cards && typeof cards === 'undefined') {
            return (<Card title="An error happened"></Card>);
        }

        return cards;
    }

    renderCurrentCards(source) {

        // Return an empty array if no cards were found
        if (!this.props.sources[source]) {
            return [];
        }

        // Return all the cards from the store
        return this.props.sources[source].map((child, index) => (
            <Card
                key={index}
                meta={child.meta}>
                {child.markdown}
            </Card>
        ));
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
