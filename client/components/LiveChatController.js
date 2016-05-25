// Dependencies
import React, { Component, PropTypes } from 'react';
import ProtoController from './ProtoController';
import Card from './Card';
import StatusView from './StatusView';
import List from './List';
import MessagesView from './MessagesView';

if (WebSocket) {
    WebSocket.prototype.sendJson = function(object) {
        let json;
        try {
            json = JSON.stringify(object);
        } catch (e) {
            throw new Error('Could not parse JSON');
            return;
        }

        this.send(json);
    };
}

class LiveChatController extends ProtoController {

    constructor(...args) {
        super(...args);
        this.joinRoomHandler = this.joinRoomHandler.bind(this);
        this.establishWebsocketConnection = this.establishWebsocketConnection.bind(this);
        this.closeWebsocketConnection = this.closeWebsocketConnection.bind(this);
        this.websocketConnectionEstablished = this.websocketConnectionEstablished.bind(this);
        this.websocketOnMessage = this.websocketOnMessage.bind(this);
        this.messageSendHandler = this.messageSendHandler.bind(this);

        this.state = Object.assign({}, this.state, {
            title: 'Livechat',
            navigation: [
                ['livechat', 'Livechat'],
            ],
            livechat: {
                name: '',
                username: '',
                joined: false,
            },
            status: {
                text: 'Not connected!',
                type: 'error',
            },
            messages: [],
            users: [],
        });

        this.websocket = undefined;
    }

    joinRoomHandler(event) {
        event.preventDefault();
        const roomName = String(event.target[0].value);
        const username = String(event.target[1].value);

        if (roomName.length || roomName) {
            this.setState({
                status: {
                    text: 'Joining room',
                    type: 'success',
                },
                livechat: {
                    name: roomName,
                    username,
                },
            });

            this.establishWebsocketConnection();
        } else {
            this.setState({
                status: {
                    text: 'Invalid roomname',
                    type: 'error',
                },
            });
        }
    }

    componentWillUnmount() {
        this.closeWebsocketConnection();
    }

    establishWebsocketConnection() {
        if (!this.websocket && window) {
            this.websocket = new WebSocket(
                'ws://' +
                window.location.host +
                '/livechatapi'
            );

            this.websocket.onopen = this.websocketConnectionEstablished;
            this.websocket.onclose = this.closeWebsocketConnection;
        }
    }

    websocketConnectionEstablished(event) {
        this.websocket.onmessage = this.websocketOnMessage;
        this.setState({
            status: {
                text: 'Connected!',
                type: 'success',
            },
        });

        // Request to connect to a specific room
        this.websocket.sendJson({
            type: 'joinRequest',
            room: this.state.livechat.name,
            username: this.state.livechat.username,
        });
    }

    websocketOnMessage(event) {
        let data = event.data;
        data = JSON.parse(data);

        switch (data.type) {
        case 'joinAccept': {
            this.setState({
                title: data.room,
                status: {
                    text: 'Connected to "' + data.room + '" as ' + this.state.livechat.username,
                    type: 'success',
                },
                livechat: {
                    room: data.room,
                    username: this.state.livechat.username,
                    joined: true,
                },
            });
            break;
        }
        case 'cancelRequest': {
            this.closeWebsocketConnection();
            break;
        }
        case 'status': {
            this.setState({
                users: data.users,
                messages: data.messages,
            });
            break;
        }
        }
    }

    closeWebsocketConnection() {
        if (this.websocket) {
            this.websocket.close();
            this.websocket = undefined;

            this.setState({
                title: 'Livechat',
                livechat: {
                    room: '',
                    username: '',
                    joined: false,
                },
                status: {
                    text: 'Not connected!',
                    type: 'error',
                },
                users: [],
                messages: [],
            });
        }
    }

    messageSendHandler(event) {
        event.preventDefault();
        if (this.websocket) {
            this.websocket.sendJson({
                type: 'addMessage',
                message: event.target[0].value,
            });
            this.refs.messageForm.reset();
        }
    }

    content(navItems, routerParams, routerPath) {

        // Prompt the user for a roomname
        let headerCard;
        let usersCard;
        let messagesCard;
        let closeButton;
        if (!this.state.livechat.joined) {
            headerCard = (
                <Card>
                    # Select chatroom
                    <form onSubmit={this.joinRoomHandler}>
                        <input placeholder="Room name"></input>
                        <input placeholder="Username"></input>
                        <button type="submit">Send</button>
                    </form>
                </Card>
            );
        } else {
            usersCard = (
                <Card>
                    # Users
                    <List>
                        {this.state.users.map((user, index) => (
                            user.username + '-' + user.identifier.slice(0, 10)
                        ))}
                    </List>
                </Card>
            );

            messagesCard = (
                <Card>
                    # Chat
                    <MessagesView
                        messages={this.state.messages}
                        livechat={this.state.livechat}>
                    </MessagesView>
                    <form onSubmit={this.messageSendHandler} ref="messageForm">
                        <input placeholder="Message"></input>
                        <button type="submit">Send</button>
                    </form>
                </Card>
            );

            closeButton = (
                <button onClick={this.closeWebsocketConnection}>Exit chatroom</button>
            );
        }

        return (
            <div>
                {headerCard}
                {messagesCard}
                {usersCard}
                <Card>
                    # Status
                    <StatusView status={this.state.status}></StatusView>
                    {closeButton}
                </Card>
            </div>
        );
    }
}

export default LiveChatController;
