'use_strict';

const AWS = require('aws-sdk');
const config = require('./../../../config');

AWS.config.update({
  region: config.awsRegion,
});

module.exports = AWS;
