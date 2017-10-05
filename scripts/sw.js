const path = require('path');
const swPrecache = require('sw-precache');
const rootDir = path.join(__dirname, '/../js');

swPrecache.write(__dirname + '/../js/service-worker.js', {
  staticFileGlobs: [
    `${rootDir}/app.js`,
    `${rootDir}/bram.js`,
    `${rootDir}/browsers.js`,
    `${rootDir}/feature.js`,
    `${rootDir}/service-worker-registration.js`
  ],
  replacePrefix: '.',
  stripPrefix: rootDir
});
