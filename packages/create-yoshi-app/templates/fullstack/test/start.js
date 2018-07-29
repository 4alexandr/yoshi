import { build } from './environment';

const env = build('development');
env
  .start()
  .then(() => console.log('Environment started'))
  .catch(error => console.error('Environment failed to start', error));

process.on('SIGHUP', async () => {
  console.log('Restarting application server...');
  await env.app.stop();
  await env.app.start();
  console.log('Application server restarted successfully...');
});
