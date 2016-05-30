// Dependencies
import React, { Component, PropTypes } from 'react';
import Card from './Card';
import StatusView from './StatusView';
import get from '../../utils/get';

class Login extends Component {

    constructor(...args) {
        super(...args);
        this.login = this.login.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

        this.state = {
            status: undefined,
            loginStatus: undefined,
        };
    }

    componentDidMount() {
        this.login();
    }

    login(payload) {
        get('/auth/status', 'POST', {
            payload,
        }, (err, response) => {
            response = JSON.parse(response);

            if (response.authenticated) {
                this.props.onauthentication(response);
            } else {
                this.setState({
                    status: {
                        type: 'error',
                        text: 'Not authenticated!',
                    },
                });
            }
        });
    }

    handleSubmit(event) {
        event.preventDefault();
        this.login({
            password: event.target[0].value,
        });
    }

    render() {
        return (
            <Card>
                # Authenticate
                <StatusView
                    status={this.state.status}>
                </StatusView>
                <form onSubmit={this.handleSubmit}>
                    <input type="password" name="password" placeholder="Password"></input>
                    <button type="submit">Log in</button>
                </form>
            </Card>
        );
    }
}

export default Login;
