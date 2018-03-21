'use_strict';

const AWS = require('./../aws');
const config = require('./../../../config');
const logger = require('./../../utils/logger');

const dynamoDBOpts = {};

if (process.env.ENVIRONMENT === 'test' && config.dynamoTableEndpoint) {
  dynamoDBOpts.endpoint = new AWS.Endpoint(config.dynamoTableEndpoint);
}
const dynamodb = new AWS.DynamoDB(dynamoDBOpts);
const { RateLimiter } = require('limiter');
const dynamoLimiter = new RateLimiter(config.dynamoLoadWriteCapacity, 'second');

/**
 * Updated provisioned throughput settings
 * @param {Integer} writeCapacityUnits
 * @return
 */
function updateProvisionedWriteCapacity(writeCapacityUnits) {
  const tag = 's3d/dynamo/updateProvisionedWriteCapacity';
  const params = {
    TableName: config.dynamoTable,
  };

  const resizeParams = {
    ProvisionedThroughput: {
      WriteCapacityUnits: writeCapacityUnits,
      ReadCapacityUnits: config.dynamoReadCapacity,
    },
  };

  return dynamodb.describeTable(params).promise().then((data) => {
    if (data.Table.ProvisionedThroughput.WriteCapacityUnits !== writeCapacityUnits) {
      logger.info('%s: updating provisioned write capacity to %s', tag, writeCapacityUnits);
      return dynamodb.updateTable(Object.assign(resizeParams, params)).promise();
    }
    return Promise.resolve();
  }).catch((err) => {
    return Promise.reject(err);
  });
}

/**
 * Prepares DynamoDB for load operation
 * @return Promise
 */
function prepare() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      updateProvisionedWriteCapacity(config.dynamoLoadWriteCapacity)
        .then(resolve)
        .catch(reject);
    }, config.dynamoScaleWait)
  });
}

/**
 * Downscales DynamoDB after load ends
 * @return Promise
 */
function downscale() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      updateProvisionedWriteCapacity(config.dynamoWriteCapacity)
        .then(resolve)
        .catch(reject);
    }, config.dynamoScaleWait)
  });
}

/**
 * Writes single batch
 * @param {Array} batch
 * @return Promise
 */
function writeBatch(batch) {
  const tag = 's3d/dynamo/writeBatch';
  const consumedCapacity = batch.length;
  var writePromise = undefined;

  dynamoLimiter.removeTokens(consumedCapacity, (err, remainingRequests) => {
    logger.debug('%s: consumed %s remaining %s', tag, consumedCapacity, remainingRequests);
    if (err) {
      logger.warn('%s: Request was rate limited. Retrying.', tag);
      return writeBatch(batch);
    }
    const params = {
      RequestItems: {},
    };
    logger.debug('%s: batch %j', tag, batch);
    params.RequestItems[config.dynamoTable] = batch;
    writePromise = dynamodb.batchWriteItem(params).promise();
  });

  return writePromise;
}

function formatItem(elem) {
  Object.keys(elem).forEach((key) => {
    Object.keys(elem[key]).forEach((typeKey) => {
      if (typeof elem[key][typeKey] !== "string") {
        elem[key][typeKey] = JSON.stringify(elem[key][typeKey]);
      }
    });
  });

  return elem;
}

/**
 * Writes all batches to dynamo
 * @param {Array} toWrite
 * @return Promise
 */
function write(toWrite) {
  const tag = 's3d/dynamo/write';
  if (toWrite.length === 0) { Promise.resolve() }
  const insertPromises = [];
  const batchSize = Math.min(config.dynamoBatchSize, config.dynamoLoadWriteCapacity);
  const iterations = Math.ceil(toWrite.length / batchSize);
  for (let i = 0; i < iterations; i += 1) {
    const from = i * batchSize;
    const to = from + batchSize;
    const batch = toWrite.slice(from, to).map(item => ({
      PutRequest: {
        Item: formatItem(item),
      },
    }));
    logger.info('%s: writing batch %s of %s', tag, i + 1, iterations);
    insertPromises.push(writeBatch(batch));
  }
  return Promise.all(insertPromises);
}

module.exports = {
  write,
  prepare,
  downscale,
};
