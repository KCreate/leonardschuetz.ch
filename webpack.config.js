// Production Switch
const production = false;

// Dependencies
const webpack         = require('webpack');
const path            = require('path');
const autoprefixer    = require('autoprefixer');
const cssnano         = require('cssnano');
const postcssfocus    = require('postcss-focus');

// Entry points
const entry = ((production) => {
    if (production) {
        return [
            './client/app/boot.js',
        ];
    } else {
        return [
            'webpack-hot-middleware/client',
            './client/app/boot.js',
        ];
    }
})(production);

// Plugins
const plugins = ((production) => {

    // Plugins used both in production and development
    const defaultPlugins = [
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.NoErrorsPlugin(),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(production ? 'production' : 'development'),
            },
        }),
    ];

    // Plugins used only in production
    const prodPlugins = [
        new webpack.optimize.UglifyJsPlugin({
            compress: { warnings: false },
        }),
    ];

    // Plugins used only in development
    const devPlugins = [
        new webpack.HotModuleReplacementPlugin(),
    ];

    if (production) {
        return defaultPlugins.concat(prodPlugins);
    } else {
        return defaultPlugins.concat(devPlugins);
    }
})(production);

// Babel presets
const babelPresets = ((production) => {
    if (production) {
        return ['react', 'es2015'];
    } else {
        return ['react', 'es2015', 'react-hmre'];
    }
})(production);

// Webpack config
module.exports = {
    production, // Production flag is now publicly available
    entry,
    plugins,
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
        publicPath: '/',
    },
    devtool: 'cheap-module-source-map',
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: {
                    presets: babelPresets,
                },
            },
            {
                test: /\.s?css$/,
                loader: 'style!css!postcss!sass',
            },
            {
                test: /\.(html|txt|md)/,
                loader: 'file?name=[name].[ext]',
            },
            {
                test: /.*\.(gif|png|jpe?g|svg|ico)$/i,
                loaders: [
                    'file?name=[name].[ext]',
                    'image-webpack',
                ],
            },
        ],
    },
    imageWebpackLoader: {
        progressive: true,
        optimizationLevel: 7,
        interlaced: false,
        pngquant: {
            quality: '65-90',
            speed: 4,
        },
    },
    postcss: () => ([autoprefixer, cssnano, postcssfocus]),
};
