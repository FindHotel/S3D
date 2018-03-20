/**
 * Read files from S3 bucket under a prefix and write their contents DynamoDB
 * @returns Promise
 */

const s3Service = require('./s3');
const dynamoDBService = require('./dynamo');
const logger = require('./../utils/logger');

const EventEmitter = require('events');
const emitter = new EventEmitter();

function call() {
  const tag = 's3d/call';

  emitter.on('batch-ready', function(batch, resolve, reject) {
    dynamoDBService.write(batch)
      .then(() => { emitter.emit('batch-written', resolve) })
      .catch(() => { emitter.emit('batch-failed', reject) });
  });

  emitter.on('batch-written', function(resolve) {
    resolve();
  });

  emitter.on('batch-failed', function(reject) {
    reject();
  });

  emitter.on('end', function() {
    logger.info('%s: all data loaded and is now writing', tag)
  });

  return dynamoDBService.prepare()
    .then(s3Service.loadData.bind(null, emitter))
    .then(dynamoDBService.downscale)
    .then(() => { logger.info('%s: Done', tag) })
    .catch((err) => { logger.error('%s: an error occured %s', tag, JSON.stringify(err)); });
}

module.exports = {
  call,
};
