function sourceReducer(sources = {}, action) {
    switch (action.type) {
    case 'ADD_ARTICLE': {

        // List of the current sources
        let currentSources = [];
        if (sources[action.source]) {
            currentSources = sources[action.source].slice(0); // Copy the array, don't reference
        }
        currentSources[action.index] = action.article;

        return Object.assign({}, sources, {
            [action.source]: currentSources,
        });
    }
    default: {
        return sources;
    }
    }
};

export default sourceReducer;
