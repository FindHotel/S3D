'use_strict';

const AWS = require('./../aws');
const config = require('./../../../config');
const logger = require('./../../utils/logger');
const ndjson = require('ndjson');

const s3 = new AWS.S3();

/**
 * Gets all s3 keys in a certain bucket under a specific prefix
 * @return Promise
 */
function getAllKeys() {
  const tag = 's3d/s3/getAllKeys';

  let allKeys = [];
  const params = { Bucket: config.s3Bucket, Prefix: config.s3Prefix };

  if (!params.Bucket || !params.Prefix) {
    return Promise.reject(new Error('S3 bucket and prefix are required'));
  }

  function populateKeys(token) {
    if (token) params.ContinuationToken = token;

    return new Promise((resolve, reject) => {
      s3.listObjectsV2(params, (err, data) => {
        if (err) {
          reject(err);
        } else if (data) {
          allKeys = allKeys.concat(data.Contents.map(o => o.Key));
          if (data.IsTruncated) {
            populateKeys(data.NextContinuationToken);
          } else {
            resolve(allKeys);
          }
        }
      });
    });
  }

  return new Promise((resolve, reject) => {
    populateKeys()
      .then((allKeys) => { resolve(allKeys); })
      .catch((err) => {
        logger.error('%s: an error occured during fetching keys %s', tag, JSON.stringify(err));
        reject(err);
      });
  });
}

/**
 * Gets data from ndjson file
 * @return Promise
 */
function getDataFromFile(key, emitter) {
  const tag = 's3d/s3/getDataFromFile';
  const params = {
    Bucket: config.s3Bucket,
    Key: key,
  };

  const data = [];
  logger.debug('%s: getting data from %s', tag, key);
  return new Promise((resolve, reject) => {
    s3.getObject(params)
      .createReadStream()
      .pipe(ndjson.parse())
      .on('data', (obj) => {
        data.push(obj);
        if (data.length === config.dynamoBatchSize) {
          emitter.emit('batch-ready', data.slice(), resolve, reject);
          data.length = 0;
        }
      })
      .on('end', () => {
        emitter.emit('batch-ready', data.slice(), resolve, reject);
        emitter.emit('end');
        data.length = 0;
      })
      .on('error', (err) => {
        reject(err);
      });
  });
}

/**
 * Loads all data in files
 * @return Promise
 */
function loadData(emitter) {
  const tag = 's3d/s3/loadData';

  const dataPromises = [];
  getAllKeys()
    .then((keys) => {
      logger.debug('%s: keys to fetch (%j)', tag, keys);
      keys.forEach((key) => {
        dataPromises.push(getDataFromFile(key, emitter));
      });

      return Promise.all(dataPromises)
    })
    .catch((err) => {
      return Promise.reject(err)
    });
}

module.exports = {
  loadData,
};
