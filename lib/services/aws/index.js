'use_strict';

const AWS = require('aws-sdk'),
  config = require('./../../../config');

AWS.config.update({
  region: config.awsRegion,
});

module.exports = AWS;
