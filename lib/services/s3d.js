/**
 * Read JSON file from S3 and Write to DynamoDB
 * @returns Promise
 */

const s3Service = require('./s3'),
      dynamoDBService = require('./dynamo')

function call() {
  const tag = `s3d/call`;

  return s3Service.loadData().then(dynamoDBService.write)
}

module.exports = {
  call,
};
