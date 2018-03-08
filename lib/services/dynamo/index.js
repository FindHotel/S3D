'use_strict';

const AWS = require('./../aws'),
      config = require('./../../../config'),
      logger = require('./../../utils/logger'),
      dynamoDBOpts = {};

if (process.env.ENVIRONMENT === 'test' && config.dynamoTableEndpoint) {
  dynamoDBOpts.endpoint = new AWS.Endpoint(config.dynamoTableEndpoint);
}
const dynamodb = new AWS.DynamoDB(dynamoDBOpts),
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
  logger.debug('%s: batch %j', tag, batch)
  params.RequestItems[config.dynamoTable] = batch;
  return dynamodb.batchWriteItem(params).promise();
}

function formatItem(elem) {
  elem.value.S = JSON.stringify(elem.value.S);
  if (elem.expires)
    elem.expires.N = JSON.stringify(elem.expires.N);
  return elem;
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
          PutRequest: {
            Item:  formatItem(elem)
          }
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
