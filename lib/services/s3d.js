/**
 * Read files from S3 bucket under a prefix and write their contents DynamoDB
 * @returns Promise
 */

const s3Service = require('./s3'),
      dynamoDBService = require('./dynamo')

function call() {
  const tag = `s3d/call`;

  return s3Service.loadData()
    .then(dynamoDBService.write)
    .catch(err => { console.log(err) })
}

module.exports = {
  call,
};
