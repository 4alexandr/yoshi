import puppeteer from 'puppeteer';
import { build } from '../environment';

export const env = build('e2e');

before(async () => {
  await env.start();
  global.browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
});

after(async () => {
  await env.stop();
  await global.browser.close();
});
