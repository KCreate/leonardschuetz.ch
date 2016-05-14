function sourceReducer(sources = {}, action) {
    switch (action.type) {
    case 'ADD_ARTICLE': {

        let currentSources = [];
        if (sources[action.source]) {
            currentSources = sources[action.source];
        }

        return Object.assign({}, sources, {
            [action.source]: currentSources.concat(action.article),
        });
    }
    default: {
        return sources;
    }
    }
};

export default sourceReducer;
