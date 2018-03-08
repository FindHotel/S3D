module.exports = {
  awsRegion: process.env.AWS_REGION,
  dynamoLoadWriteCapacity: parseInt(process.env.DYNAMO_LOAD_WRITE_CAPACITY, 10),
  dynamoTable: process.env.DYNAMO_TABLE,
  s3FileLocation: process.env.S3_FILE_LOCATION
};
