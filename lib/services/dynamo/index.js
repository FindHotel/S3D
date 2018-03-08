'use_strict';

const AWS = require('aws-sdk'),
      config = require('./../../../config'),
      logger = require('./utils/logger');

AWS.config.update({
  region: config.awsRegion
});

const opts = {};
if (process.env.ENVIRONMENT === 'test' && config.dynamoTableEndpoint) {
  opts.endpoint = new AWS.Endpoint(config.dynamoTableEndpoint);
}
const dynamodb = new AWS.DynamoDB(opts),
      batchInsertSize = 25;

/**
 * Writes single batch
 * @param {Array} batch
 * @return Promise
 */
function writeBatch(batch) {
  const tag = 's3d/dynamo/writeBatch';
  const params = {
    RequestItems: {},
  };
  params.RequestItems[config.dynamoTable] = batch;
  return dynamodb.batchWriteItem(params).promise();
}

/**
 * Writes all batches to dynamo
 * @param {Array} toWrite
 * @return Promise
 */
function write(toWrite) {
  const tag = 's3d/dynamo/write';
  const insertPromises = [];
  const iterations = Math.ceil(toWrite.length / batchInsertSize);
  logger.info('%s: using dynamo table %s', tag, config.dynamoTable);
  for (let i = 0; i < iterations; i++) {
    const from = i * batchInsertSize;
    const to = from + batchInsertSize;
    const batch = toWrite.slice(from, to).map(elem => {
      return {
          PutRequest: elem
        }
    });
    logger.info('%s: writing batch %s of %s', tag, i + 1, iterations);
    insertPromises.push(writeBatch(batch));
  }
  return Promise.all(insertPromises);
}

module.exports = {
  write,
};
