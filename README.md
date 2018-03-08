# S3D

Loads JSON files from AWS S3 and inserts them to a DynamoDB as a key-value store.

## Input
ndjson files under an s3 bucket and prefix. Each line has a JSON object containing 2 required keys (key, value) and one optional key (expires).
Example:
```json
{"key": {"S":"1"}, "value": {"S": { "BKS":1234 } },"expires": {"N": 1000}}
```

## Technical requirements
- Node.js 6.10
- AWS S3
- DynamoDB
- Docker (optional)

## Setup
- `yarn install`

## Tests
##### Run tests
```bash
yarn test
```

#### Install DynamoDB locally:
##### Download

```
https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html#DynamoDBLocal.DownloadingAndRunning
```

##### Start

```bash
java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb
```
##### Create local database

```js
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

const dynamodb = new AWS.DynamoDB({ endpoint: new AWS.Endpoint('http://localhost:8000') });
dynamodb.createTable(params, function(err, data) {
  if (err) console.log(err, err.stack);
  else     console.log(data);
});
```

## Lint
##### Run lint
```bash
yarn lint
yarn lint --fix
```
