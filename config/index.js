module.exports = {
  awsRegion: process.env.AWS_REGION,
  dynamoLoadWriteCapacity: parseInt(process.env.WRITE_CAPACITY_DURING_LOAD, 10),
  dynamoTable: process.env.TABLE_NAME,
  dynamoTableEndpoint: process.env.TABLE_ENDPOINT, // for test env only
  dynamoWriteCapacity: parseInt(process.env.WRITE_CAPACITY, 10),
  s3Bucket: process.env.S3_BUCKET,
  s3Prefix: process.env.S3_PREFIX
};
