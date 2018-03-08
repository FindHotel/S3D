'use_strict';

const AWS = require('./../aws'),
      config = require('./../../../config'),
      logger = require('./../../utils/logger'),
      s3 = new AWS.S3();

/**
 * Gets all s3 keys in a certain bucket under a specific prefix
 * @return Promise
 */
function getAllKeys() {
  const allKeys = [];
  const params = { Bucket: config.s3Bucket, Prefix: config.s3Prefix };

  function populateKeys(token) {
    if (token) params.ContinuationToken = token;

    return new Promise((resolve, reject) => {
      if (!params.Bucket || !params.Prefix) {
        reject(new Error('S3 bucket and prefix are required'))
      }

      s3.listObjectsV2(params, function(err, data) {
        if (err) {
          reject(err);
        } else if (data) {
          allKeys = allKeys.concat(data.Contents);
          if(data.IsTruncated)
            populateKeys(data.NextContinuationToken);
          else
            resolve(allKeys);
        }
      });
    })
  }

  return new Promise((resolve, reject) => {
    populateKeys()
      .then(allKeys => { resolve(allKeys) })
      .catch(err => { reject(err) })
  })
}

/**
 * Loads all data in files
 * @return Promise
 */
function loadData() {
  const tag = 's3d/s3/loadData';

  const dataPromises = [];
  getAllKeys()
    .then(keys => {
      keys.forEach((key) => {
        const params = {
          Bucket: config.s3Bucket,
          Key: key
        }

        dataPromises.push(s3.getObject(params).promise());
      })
    })
    .catch(err => {
      Promise.reject(err);
    })

  return new Promise((resolve, reject) => {
    Promise.all(dataPromises)
      .then(s3DataResponses => {
        const unflattenedResponses = s3DataResponses.map(data => data.Body.split("\n"));
        const flattenedResponses = [].concat(...unflattenedResponses);
        logger.debug('%s: all data %j', tag, flattenedResponses);
        resolve(flattenedResponses);
      })
      .catch(err => {
        reject(err);
      });
  })
  return
}

module.exports = {
  loadData,
}
