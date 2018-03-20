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
    dynamoDBService.write(batch, resolve, reject)
      .then(() => { logger.info('%s: successful batch write to DynamoDB') });
  });

  emitter.on('end', function() {});

  return dynamoDBService.prepare()
    .then(s3Service.loadData.bind(null, emitter))
    .then(dynamoDBService.downscale)
    .then(() => { logger.info('%s: Done') })
    .catch((err) => { logger.error('%s: an error occured %s', tag, JSON.stringify(err)); });
}

module.exports = {
  call,
};
