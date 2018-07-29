const path = require('path');
const bootstrap = require('wix-bootstrap-ng');
const greynode = require('wix-bootstrap-greynode');
const hadron = require('wix-bootstrap-hadron');

const rootDir = process.env.SRC_PATH || './dist/src';
const getPath = filename => path.join(rootDir, filename);

const hadronOptions = {
  staticArtifacts: [{
    artifactId: 'com.wixpress.{%projectName%}'
  }]
};

bootstrap()
  .use(greynode)
  .use(hadron, hadronOptions)
  .express(getPath('server'))
  .start({
    disableCluster: process.env.NODE_ENV === 'development'
  });
