/**
* @name Hydra-service
* @summary Hydra-service Hydra Express service entry point
* @description process and download images
*/
'use strict';

const version = require('./package.json').version;
const hydraExpress = require('hydra-express');



let config = require('fwsp-config');

/**
* Load configuration file and initialize hydraExpress app
*/
config.init('./config/config.json')
  .then(() => {
    config.version = version;
    return hydraExpress.init(config.getObject(), version, () => {
      hydraExpress.registerRoutes({
        '/v1/hydra-service': require('./routes/hydra-service-v1-routes')
      });
    });
  })
  .then(serviceInfo => console.log('serviceInfo', serviceInfo))
  .catch(err => console.log('err', err));
