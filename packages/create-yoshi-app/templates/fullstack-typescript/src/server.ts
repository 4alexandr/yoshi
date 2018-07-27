import { Router } from 'express';
import * as wixRunMode from 'wix-run-mode';
import * as ejs from 'ejs';
import * as path from 'path';
import * as wixExpressCsrf from 'wix-express-csrf';
import * as wixExpressRequireHttps from 'wix-express-require-https';

const artifactId = 'com.wixpress.autogenerated-fullstack-ts';

module.exports = (app: Router, context) => {
  const config = context.config.load('autogenerated-fullstack-ts');
  const isProduction = wixRunMode.isProduction();

  app.use(wixExpressCsrf());
  app.use(wixExpressRequireHttps);

  app.get('/', context.hadron.middleware(), (req, res) => {
    const hadron = res.locals.hadron;
    const renderModel = getRenderModel(req, hadron);
    const templatePath = path.join(
      hadron.staticLocalPath(artifactId, './src'),
      'index.ejs',
    );
    ejs.renderFile(
      templatePath,
      renderModel,
      {
        cache: isProduction,
        filename: templatePath,
      },
      (err, str) => res.send(str),
    );
  });

  function getRenderModel(req, hadron) {
    return {
      locale: req.aspects['web-context'].language,
      basename: req.aspects['web-context'].basename,
      debug:
        req.aspects['web-context'].debug ||
        process.env.NODE_ENV === 'development',
      clientTopology: {
        ...config.clientTopology,
        staticsBaseUrl: hadron.staticUrl(
          artifactId,
          config.clientTopology.staticsBaseUrl,
        ),
      },
      title: 'Wix Full Stack Project Boilerplate',
    };
  }

  return app;
};
