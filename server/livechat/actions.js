// List of all actions, their parameters and action creators
const actions = function() {

    // List of all actions, together with their required props
    this.actions = {
        joinRequest: {
            params: {
                room: String,
                username: String,
            },
            requiresBroadcast: true,
        },
        joinAccept: {
            params: {
                room: String,
            },
            requiresBroadcast: true,
        },
        cancelRequest: {
            params: {},
            requiresBroadcast: false,
        },
        addMessage: {
            params: {
                message: String,
            },
            requiresBroadcast: true,
        },
        addFile: {
            params: {
                apiResponse: Object,
                file: Object,
            },
            requiresBroadcast: true,
        },
        status: {
            params: {
                users: Array,
                messages: Array,
                room: String,
            },
            requiresBroadcast: false,
        },
        removeUser: {
            params: {
                user: String,
            },
            requiresBroadcast: true,
        },
        clearChat: {
            params: {},
            requiresBroadcast: true,
        },
    };

    // Checks if a given type, is a correct function name
    this.isValidAction = function(type) {
        return this.actions.hasOwnProperty(type);
    };

    // Checks if a given type, requires a broadcast
    this.requiresBroadcast = function(type) {
        if (this.isValidAction(type)) {
            return this.actions[type].requiresBroadcast;
        }
        return false;
    };

    // Check if all required params have been set
    this.hasRequiredProps = function(type, message) {
        if (!this.isValidAction(type)) {
            return false;
        }

        // Check if all prop keys are there
        const missingParameters = Object.keys(this.actions[type].params)
        .filter((action) => !message.hasOwnProperty(action));
        if (missingParameters.length) {
            return false;
        }

        // Check if all types are correct
        const wrongTypes = Object.keys(this.actions[type].params)
        .filter((key) => message[key].constructor !== this.actions[type].params[key]);
        if (wrongTypes.length) {
            return false;
        }

        // If all checks passed, return true
        return true;
    };

    // Construct an instructions-block for the websocket to send back to the client
    this.createWebsocketInstruction = function(type, message) {

        // Construct the instruction
        let instruction = Object.assign({}, { type }, message);

        // Parse the instruction
        instruction = JSON.stringify(instruction);

        return instruction;
    };

    // Construct an instructions-block for the livechat-api to consume
    this.createLivechatInstruction = function(type, message, options, callback) {

        // Construct the instruction
        let instruction = Object.assign({}, { type }, message, options, {
            oncomplete: callback,
        });

        // Add the time
        instruction = {
            instruction,
            time: Number(Date.now()),
        };

        return instruction;
    };
};

module.exports = actions;
