import axios from "axios";
// import SSH from "simple-ssh";
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
      // //sort array based on created date
      // arr.sort((a, b) => (new Date(a.created) < new Date(b.created) ? 1 : -1));
      devices = arr;
    });
  return devices;
};

// export const getToken = async () => {
//   const pemfile = "ubuntuOregon.cer";
//   const ssh = new SSH({
//     host: "ip-172-31-1-137.us-west-2.compute.internal",
//     user: "ubuntu",
//     key: fs.readFileSync(pemfile),
//   });
//   let prom = new Promise(function (resolve, reject) {
//     ssh
//       .exec(`echo $(cat token.txt)`, {
//         out: function (stdout) {
//           resolve(stdout);
//         },
//       })
//       .start({
//         fail: function (e) {
//           console.log("failed connection, boo");
//           console.log(e);
//         },
//       });
//   });
//   return await prom;
// };

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

export const upload_artifact = async (jwt_token) => {
  let response;

  let fd = new FormData();
  fd.append("name", "test_art_2");
  fd.append("device_types_compatible", "qemux86-64");
  fd.append("type", "single_file");
  fd.append(
    "file",
    await fs.readFileSync("./test.txt", "utf-8", function (err, data) {
      console.log(err, data);
    })
  );

  const headers = {
    Accept: "application/json",
    Authorization: "Bearer " + jwt_token,
  };

  await fetch(
    "https://hosted.mender.io/api/management/v1/deployments/artifacts/generate",
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
