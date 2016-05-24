/* eslint-disable no-var */

// Dependencies
const express   = require('express');
const path      = require('path');
const router    = new express.Router();
const livechat  = new (require('./livechat.js'))();
const actions   = new (require('./actions.js'))();

router.ws('/', (ws, req) => {

    // Configure the livechat once the websocket opens
    if (!livechat.expressWs) {
        livechat.expressWs = req.expressWs;
    }
    if (!livechat.mountPath) {
        livechat.mountPath = '/';
    }

    // Get the websocket key from the websocket
    const websocketKey = ws.upgradeReq.headers['sec-websocket-key'];
    req.websocketKey = websocketKey;

    // Different websocket event handlers
    ws.on('message', (message) => {

        /*
            Validate the following things:
            - JSON is parseable
            - A type was set,
            - The type is valid
            - All required props were given and are of the right type
        */

        // Try to parse the message
        try {
            message = JSON.parse(message);
        } catch (e) {
            return ws.send(actions.createWebsocketInstruction('cancelRequest', {
                error: 'Could not parse JSON',
            }));
        }

        // Check if a type was set
        if (!message.hasOwnProperty('type')) {
            return ws.send(actions.createWebsocketInstruction('cancelRequest', {
                error: 'No type set',
            }));
        }

        // Check if the type is valid
        if (!actions.isValidAction(message.type)) {
            return ws.send(actions.createWebsocketInstruction('cancelRequest', {
                error: 'Invalid action',
            }));
        }

        // Check if all required props were set
        if (!actions.hasRequiredProps(message.type, message)) {
            return ws.send(actions.createWebsocketInstruction('cancelRequest', {
                error: 'Missing properties',
            }));
        }

        // At this point, we can send the instruction to the livechat
        livechat.parseInstruction(actions.createLivechatInstruction(message.type, message, {
            request: req,
            websocketKey,
            websocket: ws,
        }));

    });
    ws.on('close', (event) => {
        livechat.parseInstruction(actions.createLivechatInstruction('removeUser', {}, {
            request: req,
            websocketKey,
            websocket: ws,
        }));
    });
    ws.on('error', (event) => {
        livechat.parseInstruction(actions.createLivechatInstruction('removeUser', {}, {
            request: req,
            websocketKey,
            websocket: ws,
        }));
    });
});

module.exports = router;
