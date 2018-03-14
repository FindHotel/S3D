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

## Environment variables
```bash
# General
ENVIRONMENT
LOG_LEVEL # default none

# S3 Variables
S3_BUCKET
S3_PREFIX

# Dynamo
AWS_REGION
TABLE_NAME
READ_CAPACITY
WRITE_CAPACITY_DURING_LOAD
WRITE_CAPACITY

# Dynamo (testing only)
TABLE_ENDPOINT
```

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

## Lint
##### Run lint
```bash
yarn lint
yarn lint --fix
```
