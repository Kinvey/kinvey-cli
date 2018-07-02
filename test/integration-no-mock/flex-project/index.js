const sdk = require('kinvey-flex-sdk'); // eslint-disable-line
const pkgJson = require('./package.json');

const service = sdk.service({ sharedSecret: '123' }, (err, flex) => {
  if (err) {
    console.log(err);
  }

  const dataSdk = flex.data; // gets the datalink object from the service
  const logger = service.logger;

  logger.info(`Version: ${pkgJson.version}`);
  logger.warn('A warning');
  logger.error('An error (not really).');
  logger.fatal('Fatality');

  // service objects
  const someServiceObject = dataSdk.serviceObject('MyCollection');
  someServiceObject.onGetById((context, complete, modules) => {
    logger.info('Get by ID request...');

    const myEntity = {
      id: context.entityId,
      name: 'Hard-coded entity',
      projectVersion: pkgJson.version
    };
    complete().setBody(myEntity).ok().next();
  });

  // handlers
  flex.functions.register('onPreSave', (context, complete, modules) => {
    logger.info('About to save');
    complete().setBody(context).ok().next();
  });
});
