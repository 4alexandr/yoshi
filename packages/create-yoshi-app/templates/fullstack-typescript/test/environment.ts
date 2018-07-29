import * as testkit from 'wix-bootstrap-testkit';
import * as greynodeTestkit from 'wix-greynode-testkit';
import * as hadronTestkit from 'wix-hadron-testkit';
import * as configEmitter from 'wix-config-emitter';

const environmentPorts = {
  development: 3000,
  it: 4000,
  e2e: 5000
};

export function build(type) {
  const port: number = environmentPorts[type];

  const configDir = `./target/configs/${type}`;
  const staticsDir = `./target/statics/${type}`;

  const greynode = greynodeTestkit([]);
  const hadron = hadronTestkit([], greynode, staticsDir);

  const app = testkit.server('./index', {
    timeout: 60000,
    env: {
      PORT: port,
      MANAGEMENT_PORT: port + 4,
      NEW_RELIC_LOG_LEVEL: 'warn',
      APP_CONF_DIR: configDir
    },
  });

  async function start() {
    await greynode.start();
    await greynode.emitConfig(configDir);
    await hadron.start();
    await configEmitter({
      sourceFolders: ['./templates'],
      targetFolder: configDir,
      clearTargetFolder: false
    })
      .fn('scripts_domain', 'static.parastorage.com')
      .fn('static_url', 'com.wixpress.{%projectName%}', 'http://localhost:3200/')
      .emit();
    await app.start();
  }

  async function stop() {
    await app.stop();
    await hadron.stop();
    await greynode.stop();
  }

  return {
    greynode,
    hadron,
    app,
    start,
    stop,
    beforeAndAfter: () => {
      before(() => start());
      after(() => stop());
    }
  };
}
