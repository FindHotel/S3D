const AWS = require('./../lib/services/aws'),
      logger = require('./../lib/utils/logger');

const dynamodb = new AWS.DynamoDB({ endpoint: new AWS.Endpoint('http://localhost:8000') });

var params = {
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
  TableName: "testS3D"
 };

dynamodb.createTable(params, function(err, data) {
  if (err) console.log(err, err.stack);
  else     console.log(data);
});

logger.info('Created test database');
