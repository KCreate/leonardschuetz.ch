// Dependencies
import React, { Component, PropTypes } from 'react';
import Card from './Card';
import Header from './Header';
import Content from './Content';
import Login from './Login';

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
        this.handleAuthentication = this.handleAuthentication.bind(this);
        this.authenticated = this.authenticated.bind(this);

        this.state = {
            title: 'Leonard Schuetz',
            navigation: [],
            expanded: true,
            needsAuthentication: false,
            authenticated: false,
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
        return (
            <Card>
                # This resource was not found
            </Card>
        );
    }

    handleAuthentication(event) {
        if (event.authenticated) {
            this.authenticated();
            this.setState({
                authenticated: event.authenticated,
            });
        }
    }

    authenticated() {
        return undefined;
    }

    render() {

        if (document) {
            document.title = this.state.title;
        }

        let content;
        if (!this.state.authenticated && this.state.needsAuthentication) {
            content = (
                <Content expanded={this.state.expanded}>
                    <Login onauthentication={this.handleAuthentication}></Login>
                </Content>
            );
        } else {
            content = (
                <Content expanded={this.state.expanded}>
                    {this.content(this.state.navigation, this.props.params, this.props.route)}
                </Content>
            );
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
                {content}
                <p>Copyright © (2016 - present) Leonard Schuetz</p>
            </div>
        );
    }
}

export default ProtoController;
