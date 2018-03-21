/**
 * Read files from S3 bucket under a prefix and write their contents DynamoDB
 * @returns Promise
 */

const config = require('./../../config');
const s3Service = require('./s3');
const dynamoDBService = require('./dynamo');
const logger = require('./../utils/logger');

const tag = 's3d';
const EventEmitter = require('events');
const emitter = new EventEmitter();

function defineEvents() {
  emitter.on('batch-ready', function(batch, resolve, reject) {
    dynamoDBService.write(batch)
      .then(() => { emitter.emit('batch-written', resolve) })
      .catch((err) => { emitter.emit('batch-failed', reject, err) });
  });

  emitter.on('batch-written', function(resolve) {
    resolve();
  });

  emitter.on('batch-failed', function(reject, err) {
    reject(err);
  });

  emitter.on('end', function() {
    logger.info('%s: all data loaded and is now writing', tag)
  });
}

function call() {
  logger.info('%s: loading data from S3: %s/%s to dynamo table %s', tag, config.s3Bucket, config.s3Prefix, config.dynamoTable);

  defineEvents();
  s3Service.setEventEmitter(emitter);

  return dynamoDBService.prepare()
    .then(s3Service.loadData)
    .then(dynamoDBService.downscale)
    .then(() => { logger.info('%s: Done', tag) })
    .catch((err) => {
      if (err.code === 'LimitExceededException' && err.message.includes('Provisioned throughput can be decreased 4 times within the same UTC day.')) {
        logger.warn('%s: could not downscale database. %s', tag, err.message)
        // make sure to exit with success code since main task succeeded in this case
        process.exit();
      } else {
        logger.error('%s: an error occured - %s: %s', tag, err.code, err.message);
      }
    });
}

module.exports = {
  call,
};
