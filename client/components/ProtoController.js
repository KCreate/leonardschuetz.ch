// Dependencies
import React, { Component, PropTypes } from 'react';
import Card from './Card';
import Header from './Header';
import Content from './Content';

// Router
import {
    Link,
    IndexLink,
} from 'react-router';

class ProtoController extends Component {

    constructor(...args) {
        super(...args);
        this.writingAnimationFinished = this.writingAnimationFinished.bind(this);
        this.content = this.content.bind(this);

        this.state = {
            title: 'Leonard Schuetz',
            navigation: [],
            expanded: true,
        };
    }

    writingAnimationFinished(event) {
        this.setState({
            expanded: false,
        });
    }

    /**
     * content - Return the content component used in a controller
     * @param {array} navItems - Navigation items
     * @param {object} routerParams - Router Params
     * @param {object} routerPath - Router Path
     * @return {object} - Content Component
     */
    content(navItems, routerParams, routerPath) {
        return undefined;
    }

    render() {

        if (document) {
            document.title = this.state.title;
        }

        const expandedStyle = 'body{height:100vh;overflow:hidden}';
        return (
            <div className="Controller">
                {(this.state.expanded ? (
                    <style>{expandedStyle}</style>
                ) : undefined)}
                <Header
                    title={this.state.title}
                    navigation={this.state.navigation}
                    expanded={this.state.expanded}
                    writingAnimationFinished={this.writingAnimationFinished}>
                </Header>
                <Content expanded={this.state.expanded}>
                    {this.content(this.state.navigation, this.props.params, this.props.route)}
                </Content>
                <p>Copyright © 2016 - present Leonard Schuetz</p>
            </div>
        );
    }
}

export default ProtoController;
