// Dependencies
import React, { Component } from 'react';
import Card from './Card';
import Header from './Header';
import Content from './Content';
import Login from './Login';
import get from '../../utils/get';

class ProtoController extends Component {

    constructor(...args) {
        super(...args);
        this.writingAnimationFinished = this.writingAnimationFinished.bind(this);
        this.content = this.content.bind(this);
        this.authenticate = this.authenticate.bind(this);
        this.appGotAuthenticated = this.appGotAuthenticated.bind(this);

        this.state = {
            title: 'Leonard Schuetz',
            navigation: [],
            expanded: true,
            needsAuthentication: false,
            authenticated: false,
        };

        this.authenticate();
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

    /*
        The ProtoController's own authentication request
        If the user is already logged in, he won't see the login dialog
    */
    authenticate(event) {

        if (event) {
            if (event.authenticated) {
                this.appGotAuthenticated();
                this.setState({
                    authenticated: event.authenticated,
                });
                return;
            }
        }

        // Get the authorization status
        get('/auth/status', 'POST', {}, (err, response) => {
            if (!err) {
                response = JSON.parse(response);
                if (!this.state.authenticated) {
                    this.setState({
                        authenticated: response.authenticated,
                    });
                    this.appGotAuthenticated();
                }
            }
        });
    }

    /*
        The appGotAuthenticated method can be viewed as a second componentDidMount,
        but for being authenticated.
    */
    appGotAuthenticated(authenticated) {
        return authenticated;
    }

    render() {

        if (document) {
            document.title = this.state.title;
        }

        let content;
        if (!this.state.authenticated && this.state.needsAuthentication) {
            content = (
                <Content expanded={this.state.expanded}>
                    <Login onauthentication={this.authenticate}></Login>
                </Content>
            );
        } else if (this.state.authenticated) {
            content = (
                <Content expanded={this.state.expanded}>
                    {this.content(this.state.navigation, this.props.params, this.props.route)}
                    <Card>
                        # Logout
                        <button><a href="/auth/logout">Log out</a></button>
                    </Card>
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
