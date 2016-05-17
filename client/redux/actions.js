import constants from './constants';

const actions = {
    addArticles(source, article, index) {
        return {
            type: constants.ADD_ARTICLE,
            source,
            article,
            index,
        };
    },
};
export default actions;
