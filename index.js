import { createRequire } from "module";
const require = createRequire(import.meta.url);

import dotenv from "dotenv";
dotenv.config();

const AWS = require("aws-sdk");

AWS.config.update({ region: "us-west-2" });

import {
  // getToken,
  list_users,
  list_artifacts,
  deployArtifact,
  list_deployments,
  list_devices,
  auditlogs,
  upload_artifact,
} from "./utils.js";

export const handler = async (event = null, context) => {
  let res;
  let cmd = 0;

  if (event.queryStringParameters) {
    cmd = event.queryStringParameters.cmd;
  } else {
    return {
      statusCode: 200,
      body: "Yeah API is working fine!...... Hopefully! All of it...... :)",
    };
  }
  const jwt_token = process.env.MENDER_JWT_TOKEN;

  res = await askMender(event, context, jwt_token, cmd);
  res = JSON.stringify(res);

  const response = {
    statusCode: 200,
    body: res,
  };
  return response;
};

const askMender = async (event, context, jwt_token, cmd) => {
  let res;
  switch (cmd) {
    case "1":
      res = {
        list_users: await list_users(jwt_token),
      };
      break;
    case "2":
      res = {
        list_artifacts: await list_artifacts(jwt_token),
      };
      break;
    case "3":
      res = {
        list_deployments: await list_deployments(jwt_token),
      };
      break;
    case "4":
      res = {
        auditlogs: await auditlogs(jwt_token),
      };
      break;
    case "5":
      res = {
        list_devices: await list_devices(jwt_token),
      };
      break;
    case "01":
      let artifact_name = event.queryStringParameters.artifact_name;
      if (!artifact_name) artifact_name = "undefined";

      res = {
        upload_artifact: await upload_artifact(
          context,
          jwt_token,
          artifact_name
        ),
      };
      break;
    case "s3key":
      res = {
        key: {
          accessKeyId: process.env.ACCESS_KEY_ID,
          secretAccessKey: process.env.SECRET_ACCESS_KEY,
        },
      };
      break;
    case "s3list":
      res = {
        item_list: await getListFromS3(),
      };
      break;
  }
  return res;
};

const getListFromS3 = () => {
  const s3 = new AWS.S3({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  });

  return s3.listObjectsV2({ Bucket: "e-storage-bucket" }).promise();
};

// console.log(await handler({ queryStringParameters: { cmd: "s3list" } }));
