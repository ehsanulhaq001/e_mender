import { createRequire } from "module";
const require = createRequire(import.meta.url);

import dotenv from "dotenv";
dotenv.config();

import fs from "fs";

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

export const handler = async (event = null) => {
  let res;
  let cmd = 0;

  if (event.queryStringParameters) {
    cmd = event.queryStringParameters.cmd;
  } else {
    return {
      statusCode: 200,
      body: `Yeah API is working fine!...... Hopefully! All of it...... :)`,
    };
  }

  const jwt_token = await fs
    .readFileSync("jwt_token.txt", "utf8", (err) => console.error(err))
    .toString()
    .split("\n")[0];

  res = await askMender(jwt_token, cmd);
  res = JSON.stringify(res);

  const response = {
    statusCode: 200,
    body: res,
  };
  return response;
};

const askMender = async (jwt_token, cmd) => {
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
      res = {
        upload_artifact: await upload_artifact(jwt_token),
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
  }
  return res;
};

const getDataFromS3 = () => {
  const s3 = new AWS.S3({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  });

  const params = {
    Bucket: "e-storage-bucket",
    Key: "image.png",
  };
  return s3.listObjectsV2({ Bucket: "e-storage-bucket" }).promise();
  // return s3.getObject(params).promise();
};
console.log(await handler({ queryStringParameters: { cmd: "5" } }));
