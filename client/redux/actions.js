import constants from './constants';

const actions = {
    addArticles(source, article) {
        return {
            type: constants.ADD_ARTICLE,
            source,
            article,
        };
    },
};
export default actions;
