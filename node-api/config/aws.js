const AWS = require("aws-sdk");
require("dotenv").config();

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
  ACL: "public-read",
});

const s3 = new AWS.S3();
const ses = new AWS.SES({ apiVersion: "2010-12-01" });

module.exports = {
  s3,
  ses,
};
