const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const RtlCssPlugin = require('rtlcss-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');
const { isObject } = require('lodash');
const { staticsDomain } = require('../src/constants');
const StylableWebpackPlugin = require('stylable-webpack-plugin');
const {
  mergeByConcat,
  isSingleEntry,
  inTeamCity,
  isProduction,
} = require('../src/utils');
const projectConfig = require('./project');
const webpackConfigCommon = require('./webpack.config.common');

const defaultSplitChunksConfig = {
  chunks: 'all',
  name: 'commons',
  minChunks: 2,
};

const artifactName = process.env.ARTIFACT_ID;
const artifactVersion = process.env.ARTIFACT_VERSION;

const constructArtifactBaseUrl = () =>
  [staticsDomain, artifactName, artifactVersion].join('/') + '/';

const ASSET_PATH =
  artifactName && artifactVersion ? constructArtifactBaseUrl() : '/';

const config = ({
  min,
  separateCss = projectConfig.separateCss(),
  hmr,
  analyze,
} = {}) => {
  const disableModuleConcat =
    process.env.DISABLE_MODULE_CONCATENATION === 'true';
  const projectName = projectConfig.name();
  const cssModules = projectConfig.cssModules();
  const tpaStyle = projectConfig.tpaStyle();
  const useSplitChunks = projectConfig.splitChunks();
  const splitChunksConfig = isObject(useSplitChunks)
    ? useSplitChunks
    : defaultSplitChunksConfig;

  if (separateCss === 'prod') {
    if (inTeamCity() || isProduction()) {
      separateCss = true;
    } else {
      separateCss = false;
    }
  }

  const stylableSeparateCss = false; // this is a temporary fix until stylable will be concatenated into a single css bundle of the app

  return mergeByConcat(webpackConfigCommon, {
    entry: getEntry(),

    mode: isProduction() ? 'production' : 'development',

    optimization: {
      minimize: min,
      splitChunks: useSplitChunks ? splitChunksConfig : false,
      concatenateModules: isProduction() && !disableModuleConcat,
    },

    module: {
      rules: [
        ...require('../src/loaders/sass')({
          separateCss,
          cssModules,
          tpaStyle,
          projectName,
          hmr,
          min,
        }).client,
        ...require('../src/loaders/less')({
          separateCss,
          cssModules,
          tpaStyle,
          projectName,
          hmr,
          min,
        }).client,
      ],
    },

    plugins: [
      ...(analyze ? [new BundleAnalyzerPlugin()] : []),

      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),

      new webpack.LoaderOptionsPlugin({
        minimize: min,
      }),

      new DuplicatePackageCheckerPlugin({ verbose: true }),

      new webpack.DefinePlugin({
        'process.env.NODE_ENV': isProduction()
          ? '"production"'
          : '"development"',
        'window.__CI_APP_VERSION__': process.env.ARTIFACT_VERSION
          ? `"${process.env.ARTIFACT_VERSION}"`
          : '"0.0.0"',
      }),

      new StylableWebpackPlugin({
        outputCSS: stylableSeparateCss,
        filename: '[name].stylable.bundle.css',
        includeCSSInJS: !stylableSeparateCss,
        optimize: { classNameOptimizations: false, shortNamespaces: false },
      }),

      ...(!separateCss
        ? []
        : [
            new MiniCssExtractPlugin({
              filename: min ? '[name].min.css' : '[name].css',
            }),
            new RtlCssPlugin(min ? '[name].rtl.min.css' : '[name].rtl.css'),
          ]),
    ],

    devtool: inTeamCity() ? 'source-map' : 'cheap-module-source-map',

    performance: {
      ...(isProduction() ? projectConfig.performanceBudget() : {}),
    },

    output: {
      umdNamedDefine: true,
      path: path.resolve('./dist/statics'),
      filename: min ? '[name].bundle.min.js' : '[name].bundle.js',
      chunkFilename: min ? '[name].chunk.min.js' : '[name].chunk.js',
      pathinfo: !min,
      publicPath: ASSET_PATH,
    },

    target: 'web',
  });
};

function getEntry() {
  const entry = projectConfig.entry() || projectConfig.defaultEntry();
  return isSingleEntry(entry) ? { app: entry } : entry;
}

module.exports = config;
