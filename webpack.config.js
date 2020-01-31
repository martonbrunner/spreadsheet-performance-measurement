const webpack = require('webpack');
const path = require('path');

const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CleanTerminalWebpackPlugin = require('clean-terminal-webpack-plugin');
const { WebpackPluginServe } = require('webpack-plugin-serve');
const TerserWebpackPlugin = require('terser-webpack-plugin');

const screens = {
    index: {
        name: 'main',
        htmlName: 'index',
        title: 'Spreadsheet Performance Measurement',
    },
};

module.exports = function (env = {}, argv = {}) {
    return {
        mode: env.prod ? 'production' : 'development',

        devtool: 'source-map',

        resolve: {
            extensions: ['.ts', '.js'],
        },

        entry: getEntryConfig(screens, env, argv),

        output: {
            filename: env.prod ? '[name]-[contenthash].js' : '[name].js',
            path: path.resolve(__dirname, 'dist'),
        },

        module: {
            rules: [
                {
                    test: /\.ts$/,
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: 'ng-annotate-loader',
                            options: {
                                ngAnnotate: 'ng-annotate-patched',
                            },
                        },
                        {
                            loader: 'ts-loader',
                            options: {
                                transpileOnly: true,
                            },
                        },
                        {
                            loader: 'eslint-loader',
                            options: {
                                failOnError: true,
                            },
                        },
                    ],
                },
                {
                    test: /\.js$/,
                    use: 'source-map-loader',
                },
                {
                    test: /\.html$/,
                    exclude: /src\/index.html$/,
                    use: 'html-loader',
                },
                {
                    test: /\.scss$/,
                    use: ['style-loader', 'css-loader', 'sass-loader'],
                },
                {
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader'],
                },
                {
                    test: /\.(svg|png|jpg|gif)$/,
                    use: {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[hash].[ext]',
                            outputPath: 'imgs',
                        },
                    },
                },
                {
                    test: /\.(ttf|eot|woff)$/,
                    loader: 'file-loader',
                },
            ],
        },

        stats: {
            assets: false,
            children: false,
            colors: true,
            errorDetails: true,
            hash: false,
            modules: false,
            warnings: true,
        },

        optimization: {
            splitChunks: {
                chunks: 'all',
                name: 'vendor',
            },

            minimizer: [
                // workarounds for some smaller sourcemap issues
                new TerserWebpackPlugin({
                    terserOptions: {
                        sourceMap: true,
                        compress: {
                            collapse_vars: false,
                            conditionals: false,
                        },
                        mangle: false,
                    },
                }),
            ],
        },

        plugins: [
            new CleanWebpackPlugin(),
            new webpack.ProvidePlugin({
                $: 'jquery',
                jquery: 'jquery',
                'window.jQuery': 'jquery',
                jQuery: 'jquery',
            }),
            new ForkTsCheckerWebpackPlugin({
                async: false,
            }),
            ...getHtmlWebpackPluginConfigs(screens),
            ...getDevPluginConfigs(env, argv),
        ],
    };


};


function getEntryConfig(screens, env, argv) {
    const entry = Object.entries(screens).reduce((config, [id, { name }]) => {
        return { ...config, [id]: `./src/${name}/index.ts` };
    }, {});
    if (!env.prod) {
        entry.client = 'webpack-plugin-serve/client';
    }
    return entry;
}

function getHtmlWebpackPluginConfigs(screens) {
    return Object.entries(screens).map(([id, { htmlName, title }]) => {
        return new HtmlWebpackPlugin({
            chunks: ['vendor', 'client', id],
            template: 'src/index.html',
            filename: `${htmlName}.html`,
            title,
        });
    });
}

function getDevPluginConfigs(env, argv) {
    if (!argv.watch) { return []; }

    return [
        new CleanTerminalWebpackPlugin(),
        new WebpackPluginServe({
            static: path.resolve(__dirname, 'dist'),
            hmr: false,
            liveReload: true,
            compress: true,
        }),
    ];
}
