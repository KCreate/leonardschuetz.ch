// Dependencies
import React, { Component, PropTypes } from 'react';
import ProtoController from './ProtoController';
import Card from './Card';
import StatusView from './StatusView';

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

        if (roomName.length || roomName) {
            this.setState({
                status: {
                    text: 'Joining room',
                    type: 'success',
                },
                livechat: {
                    name: roomName,
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
        });
    }

    websocketOnMessage(event) {
        let data = event.data;
        data = JSON.parse(data);

        switch (data.type) {
        case 'joinSuccess': {
            this.setState({
                status: {
                    text: 'Connected to room: ' + data.room + '!',
                    type: 'success',
                },
                livechat: {
                    room: data.room,
                    joined: true,
                },
            });
            break;
        }
        case 'joinDeny': {
            this.closeWebsocketConnection();
            break;
        }
        case 'status': {
            this.setState({
                users: data.room.users,
                messages: data.room.messages,
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
                livechat: {
                    room: '',
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
                type: 'message',
                message: event.target[0].value,
                room: this.state.livechat.room,
            });
            this.refs.messageForm.reset();
        }
    }

    content(navItems, routerParams, routerPath) {

        // Prompt the user for a roomname
        let headerCard;
        let chatCard;
        if (!this.state.livechat.joined) {
            headerCard = (
                <Card>
                    # Select chatroom
                    <form onSubmit={this.joinRoomHandler}>
                        <input name="roomname" placeholder="Room name"></input>
                        <input type="submit" value="Join room"></input>
                    </form>
                </Card>
            );
        } else {
            chatCard = (
                <Card>
                    {'# ' + this.state.livechat.room}
                    <form onSubmit={this.messageSendHandler} ref="messageForm">
                        <input name="roomname" placeholder="Message"></input>
                        <input type="submit" value="Send"></input>
                    </form>
                </Card>
            );
        }

        return (
            <div>
                {headerCard}
                <Card>
                    # Status
                    <StatusView status={this.state.status}></StatusView>
                    {JSON.stringify([this.state.users, this.state.messages])}
                </Card>
                {chatCard}
            </div>
        );
    }
}

export default LiveChatController;
