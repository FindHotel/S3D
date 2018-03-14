const { getLogger } = require('log4js');

const logger = getLogger();
logger.level = process.env.LOG_LEVEL || 'debug';
module.exports = logger;
