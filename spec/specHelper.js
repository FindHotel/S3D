'use_strict';

const path = require('path'),
      jsonPath = path.join(__dirname, './../config/environments', 'test.json');
require('json-env')(jsonPath);

// Generate a random table name
process.env.TABLE_NAME = `${process.env.TABLE_NAME}${Math.random().toString(36).substring(7)}`;

const AWS = require('./../lib/services/aws'),
      logger = require('./../lib/utils/logger'),
      config = require('./../config'),
      dynamodb = new AWS.DynamoDB({ endpoint: new AWS.Endpoint(config.dynamoTableEndpoint) }),
      Jasmine = require('jasmine'),
      chai = require('chai'),
      chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

var deletionParams = {
  TableName: config.dynamoTable,
}

function runSuite() {
  var tableParams = {
    AttributeDefinitions: [
      {
        AttributeName: "key",
        AttributeType: "S"
      }
    ],
    KeySchema: [
      {
        AttributeName: "key",
        KeyType: "HASH"
       }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    },
    TableName: config.dynamoTable,
  };

  dynamodb.createTable(tableParams).promise().then(() => {
    const jasmine = new Jasmine();

    logger.info('loading test suite');
    jasmine.loadConfig({
      spec_dir: './',
      spec_files: ['./!(node_modules)**/*.spec.js',
        './!(node_modules)**/**/*.spec.js',
      ],
      helpers: [
        // 'helpers/**/*.js',
      ],
      stopSpecOnExpectationFailure: false,
      random: false,
    });

    jasmine.onComplete((passed) => {
      if (passed) {
        logger.info('all specs have passed');
        const exitCode = 0;
      } else {
        logger.error('at least one spec has failed');
        const exitCode = 1;
      }

      dynamodb.deleteTable(deletionParams).promise().then(process.exit.bind(null, exitCode));
    });

    jasmine.execute();
  })
}

runSuite();
