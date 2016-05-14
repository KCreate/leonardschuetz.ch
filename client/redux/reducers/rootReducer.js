// Dependencies
import { combineReducers } from 'redux';

// Sub reducers
import sourceReducer from './sourceReducer';

// Create the root reducer
const rootReducer = combineReducers({
    sources: sourceReducer,
});

// Export
export default rootReducer;
