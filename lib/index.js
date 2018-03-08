const s3d = require('./services/s3d'),
      { getLogger } = require('log4js'),
      logger = getLogger();

module.exports = function() {
  logger.info('Test.')
}
