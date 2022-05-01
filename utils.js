import { createRequire } from "module";
const require = createRequire(import.meta.url);
import axios from "axios";
import fs from "fs";
import fetch from "node-fetch";
import FormData from "form-data";

export const list_artifacts = async (jwt_token) => {
  let artifacts = [];

  const headers = {
    Accept: "application/json",
    Authorization: "Bearer " + jwt_token,
  };

  await axios
    .get(
      "https://hosted.mender.io/api/management/v1/deployments/artifacts/list",
      {
        headers: headers,
      }
    )
    .then((res) => {
      return res.data;
    })
    .then((arr) => {
      //sort array based on modified date
      arr.sort((a, b) =>
        new Date(a.modified) < new Date(b.modified) ? 1 : -1
      );
      artifacts = arr;
    });
  return artifacts;
};

export const deployArtifact = async (
  jwt_token,
  deployment_name,
  artifact_name,
  devices = ["0d0b09e0-06f9-4be2-9b36-efa2f6adfda0"]
) => {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json, text/plain, */*",
    Authorization: "Bearer " + jwt_token,
  };

  let status;

  await axios
    .post(
      "https://hosted.mender.io/api/management/v1/deployments/deployments",
      {
        name: deployment_name,
        artifact_name: artifact_name,
        devices: devices,
      },
      { headers: headers }
    )
    .then(function (res) {
      status = res.status;
    });
  return status;
};

export const list_deployments = async (jwt_token) => {
  let deployments = [];

  const headers = {
    Accept: "application/json",
    Authorization: "Bearer " + jwt_token,
  };

  await axios
    .get("https://hosted.mender.io/api/management/v1/deployments/deployments", {
      headers: headers,
    })
    .then((res) => {
      return res.data;
    })
    .then((arr) => {
      //sort array based on created date
      arr.sort((a, b) => (new Date(a.created) < new Date(b.created) ? 1 : -1));
      deployments = arr;
    });
  return deployments;
};

export const list_devices = async (jwt_token) => {
  const headers = {
    Accept: "application/json",
    Authorization: "Bearer " + jwt_token,
  };
  let devices = [];

  await axios
    .get("https://hosted.mender.io/api/management/v1/inventory/devices", {
      headers: headers,
    })
    .then((res) => {
      return res.data;
    })
    .then((arr) => {
      //sort array based on created date
      // arr.sort((a, b) => (new Date(a.created) < new Date(b.created) ? 1 : -1));
      devices = arr;
    });
  return devices;
};

export const list_users = async (jwt_token) => {
  let resp;
  const headers = {
    Accept: "application/json",
    Authorization: `Bearer ${jwt_token}`,
  };
  await axios
    .get("https://hosted.mender.io/api/management/v1/useradm/users", {
      headers: headers,
    })
    .then((res) => {
      return res.data;
    })
    .then((body) => {
      resp = body;
    });

  return resp;
};

export const auditlogs = async (jwt_token) => {
  let resp;
  const headers = {
    Accept: "application/json",
    Authorization: `Bearer ${jwt_token}`,
  };
  await axios
    .get("https://hosted.mender.io/api/management/v1/auditlogs/logs", {
      headers: headers,
    })
    .then((res) => {
      return res.data;
    })
    .then((body) => {
      resp = body;
    });

  return resp;
};

export const upload_artifact = async (context, jwt_token, artifact_name) => {
  let response;

  let fd = new FormData();
  let data0;
  try {
    await getArtifactFromS3(artifact_name).then((res) => {
      data0 = res.Body;
    });
  } catch {
    return {
      message: "Artifact with name " + artifact_name + " not uploaded yet",
    };
  }
  fs.writeFileSync("/tmp/artifact.mender", data0, function (err) {
    if (err) {
      context.fail("writeFile failed: " + err);
    } else {
      context.succeed("writeFile succeeded");
    }
  });

  let data = fs.createReadStream("/tmp/artifact.mender");
  fd.append("artifact", data);

  const headers = {
    Accept: "application/json",
    Authorization: "Bearer " + jwt_token,
  };

  await fetch(
    "https://hosted.mender.io/api/management/v1/deployments/artifacts",
    {
      method: "POST",
      body: fd,
      headers: headers,
    }
  )
    .then(function (res) {
      return res.status;
    })
    .then(function (body) {
      response = body;
    });
  return response;
};

const getArtifactFromS3 = (artifact_name) => {
  const AWS = require("aws-sdk");
  AWS.config.update({ region: "us-west-2" });

  const s3 = new AWS.S3({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  });

  const params = {
    Bucket: "e-storage-bucket",
    Key: artifact_name,
  };
  return s3.getObject(params).promise();
};
