/**
 * Read files from S3 bucket under a prefix and write their contents DynamoDB
 * @returns Promise
 */

const s3Service = require('./s3'),
      dynamoDBService = require('./dynamo'),
      logger = require('./../utils/logger');

function call() {
  const tag = `s3d/call`;

  return dynamoDBService.prepare()
    .then(s3Service.loadData)
    .then(dynamoDBService.write)
    .then(dynamoDBService.downscale)
    .catch(err => { logger.error('%s: an error occured %s', tag, JSON.stringify(err)) })
}

module.exports = {
  call,
};
