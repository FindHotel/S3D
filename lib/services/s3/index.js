'use_strict';

const AWS = require('./../aws'),
      config = require('./../../../config'),
      logger = require('./../../utils/logger'),
      ndjson = require('ndjson'),
      s3 = new AWS.S3();

/**
 * Gets all s3 keys in a certain bucket under a specific prefix
 * @return Promise
 */
function getAllKeys() {
  let allKeys = [];
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
          allKeys = allKeys.concat(data.Contents.map(o => o.Key));
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
 * Gets data from ndjson file
 * @return Promise
 */
function getDataFromFile(key) {
  const params = {
    Bucket: config.s3Bucket,
    Key: key
  }

  const data = [];
  return new Promise((resolve, reject) => {
    s3.getObject(params)
      .createReadStream()
      .pipe(ndjson.parse())
      .on('data', (obj) => {
        data.push(obj);
      })
      .on('end', () => {
        resolve(data);
      })
  })
}

/**
 * Loads all data in files
 * @return Promise
 */
function loadData() {
  const tag = 's3d/s3/loadData';

  return new Promise((resolve, reject) => {
    const dataPromises = [];
    getAllKeys()
      .then(keys => {
        logger.debug('%s: keys to fetch (%j)', tag, keys);
        keys.forEach((key) => {
          dataPromises.push(getDataFromFile(key));
        })

        logger.debug('yea')
        Promise.all(dataPromises)
          .then(s3DataResponses => {
            const flattenedResponses = [].concat(...s3DataResponses);
            logger.debug('%s: all data %j', tag, flattenedResponses);
            resolve(flattenedResponses);
          })
          .catch(err => {
            reject(err);
          });
      })
      .catch(err => {
        Promise.reject(err);
      })
  })
}

module.exports = {
  loadData,
}
