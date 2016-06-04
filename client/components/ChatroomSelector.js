// Dependencies
import React, { Component } from 'react';
import Card from './Card';
import LimitedInput from './LimitedInput';

class ChatroomSelector extends Component {

    constructor(...args) {
        super(...args);
        this.onchange = this.onchange.bind(this);
        this.submitHandler = this.submitHandler.bind(this);

        this.state = {
            value: '',
        };
    }

    onchange(value) {
        this.setState({
            value,
        });
    }

    submitHandler(event) {
        this.props.submitHandler(event);
        this.setState({
            value: '',
        });
    }

    render() {
        return (
            <Card>
                # Select chatroom
                <form onSubmit={this.submitHandler}>
                    <input placeholder="Room name"></input>
                        <LimitedInput
                            placeholder="Username"
                            maxlength={20}
                            value={this.state.value}
                            onChange={this.onchange}></LimitedInput>
                    <button type="submit">Send</button>
                </form>
            </Card>
        );
    }
}

export default ChatroomSelector;
