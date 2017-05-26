const path = require('path');
const swPrecache = require('sw-precache');
const rootDir = path.join(__dirname, '/../js');

swPrecache.write(__dirname + '/../js/service-worker.js', {
  staticFileGlobs: [
    `${rootDir}/app.js`,
    `${rootDir}/main.js`,
    //`${rootDir}/manifest.json`,
    `${rootDir}/service-worker-registration.js`
  ],
  replacePrefix: '.',
  stripPrefix: rootDir
});
