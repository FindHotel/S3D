/**
 * Read files from S3 bucket under a prefix and write their contents DynamoDB
 * @returns Promise
 */

const s3Service = require('./s3'),
      dynamoDBService = require('./dynamo'),
      logger = require('./../utils/logger');

function call() {
  const tag = `s3d/call`;

  return s3Service.loadData()
    .then(dynamoDBService.write)
    .catch(err => { logger.error('%s: an error occured %j', tag, err) })
}

module.exports = {
  call,
};
