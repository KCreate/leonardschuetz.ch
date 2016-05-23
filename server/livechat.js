/* eslint-disable no-var */

// Dependencies
const express   = require('express');
const path      = require('path');
const router    = new express.Router();

router.ws('/', (ws, req) => {
    ws.on('message', (message) => {

        // Try to parse the json
        try {
            message = JSON.parse(message);
        } catch (e) {
            return ws.send(JSON.stringify({
                type: 'joinDeny',
            }));
        }

        // Get the identifier from the connection
        const identifier = ws.upgradeReq.headers['sec-websocket-key'];

        // Let the livechat api handle this
        LiveChat.receive(ws, req, Object.assign(message, {
            identifier,
        }));
    });

    // Let the livechat api handle this
    ws.on('close', () => {

        // Get the identifier from the connection
        const identifier = ws.upgradeReq.headers['sec-websocket-key'];
        LiveChat.receive(ws, req, {
            identifier,
            type: 'CLOSE',
        });
    });
    ws.on('error', () => {

        // Get the identifier from the connection
        const identifier = ws.upgradeReq.headers['sec-websocket-key'];
        LiveChat.receive(ws, req, {
            identifier,
            type: 'ERROR',
        });
    });
});

module.exports = router;

var LiveChat = function() {
    this.chatRooms = {};

    this.roomExists = (name) => this.chatRooms[name];
    this.existsInRoom = (room, user) => {
        if (this.roomExists(room)) {
            return this.chatRooms[room].users.filter((roomUser) => roomUser.identifier === user.identifier).length;
        }

        return false;
    };

    this.receive = (ws, req, frame) => {
        switch (frame.type) {
        case 'joinRequest': {
            if (!this.roomExists(frame.room)) {
                this.chatRooms = Object.assign({}, this.chatRooms, {
                    [frame.room]: {
                        users: [],
                        messages: [],
                    },
                });
                this.addUser(frame.room, frame, ws);
            } else {
                this.addUser(frame.room, frame, ws);
            }

            ws.send(JSON.stringify({
                type: 'joinSuccess',
                room: frame.room,
            }));
            break;
        }
        case 'message': {
            if (this.roomExists(frame.room)) {
                this.addMessage(frame.room, frame, ws);
            }
            break;
        }
        case 'ERROR', 'CLOSE': {
            console.log(this.quickLookupUser(frame), frame);
            this.removeUser(
                this.quickLookupUser(frame),
                frame,
                ws
            );
            break;
        }
        }

        this.statusUpdate(ws, frame.room, frame);
    };

    this.statusUpdate = (ws, room, user) => {
        if (this.existsInRoom(room, user)) {
            ws.send(JSON.stringify({
                type: 'status',
                room: this.chatRooms[room],
            }));
        }
    };

    this.addUser = (room, user, ws) => {
        console.log(this.existsInRoom(room, user), room, user);
        if (!this.existsInRoom(room, user)) {
            this.chatRooms[room].users.push({
                identifier: user.identifier,
            });
            this.quickLookupTable[user.identifier] = room;
        }
    };

    this.removeUser = (room, user, ws) => {
        if (this.existsInRoom(room, user)) {

            // Find the index of the user
            var indexOfUser = -1;
            this.chatRooms[room].users.forEach((roomUser, index) => {
                if (roomUser.identifier === user.identifier) {
                    indexOfUser = index;
                }
            });

            if (indexOfUser > -1) {
                this.chatRooms[room].users.splice(indexOfUser, 1);
                delete this.quickLookupTable[user.identifier];

                if (!this.chatRooms[room].users.length) {
                    delete this.chatRooms[room];
                }
            }
        }
    };

    this.addMessage = (room, frame, ws) => {
        if (this.roomExists(room)) {
            this.chatRooms[room].messages.push(frame.message);
        }
    };

    this.quickLookupTable = {};
    this.quickLookupUser = (user) => this.quickLookupTable[user.identifier];
};
LiveChat = new LiveChat();
