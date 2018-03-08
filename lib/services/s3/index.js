'use_strict';

const AWS = require('aws-sdk');
const config = require('./../../../config');

AWS.config.update({
  region: config.awsRegion
});

const s3 = new AWS.S3();
