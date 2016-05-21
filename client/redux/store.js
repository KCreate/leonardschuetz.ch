// Dependencies
import {
    applyMiddleware,
    compose,
    createStore,
} from 'redux';
import rootReducer from './reducers/rootReducer';
import thunk from 'redux-thunk';

// Different middleware for production
let middleware = [thunk];
if (process.env.NODE_ENV !== 'production') {
    const logger = require('redux-logger');
    middleware = [
        ...middleware,
        // logger(),
    ];
}

const customCreateStore = compose(
    applyMiddleware(...middleware)
)(createStore);

// exports configureStore & initial state
export default function configureStore() {
    return customCreateStore(rootReducer, {
        sources: {},
    });
}
