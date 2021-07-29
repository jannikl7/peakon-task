const express = require("express");
const axios = require("axios");
const test = require("./test/test.js");

module.exports.register_endpoint = "http://localhost:9876/api/webhooks";
module.exports.call_endpoint = "http://localhost:9876/api/webhooks/test";
let lastResult;

let app = express();
app.use(express.json());
let port = 9876;

//since focus is not on persistence I will
//prioritize ease and clarity of implementation vs. performance
//for storing the webhooks. An implementation of HashMap or similar
//would make this solution faster at scale.
var clients = [];

/**
 * Class holding the client id and the registered webhooks
 */
class Client {
  webhooks = [];
  constructor(clientId) {
    this.clientId = clientId;
  }
}

/**
 * Simple
 */
class Webhook {
  constructor(url, token) {
    this.url = url;
    this.token = token;
  }
}

/**
 * Utility function which registers a webhook on a given client id.
 * The client will be generated if it does not already exist in storage.
 *
 * @param {*} clientId
 * @param {*} url
 * @param {*} token
 * @returns
 */
function register(clientId, url, token) {
  let client = clients.find((o) => o.clientId === clientId);
  if (!(client instanceof Client)) {
    client = new Client(clientId);
    clients.push(client);
  }

  client.webhooks.push(new Webhook(url, token));

  return client;
}

/**
 * Service for registering webhooks.
 * This service assumes a clientId has already
 * been created for the requestor.
 *
 * Expects a JSON body such as:
 * {
 *  "clientId": "client 1",
 *  "url": "http://localhost:1234/hook",
 *  "token": "mytoken1"
 * }
 */
app.post("/api/webhooks", (req, res) => {
  //validate json body
  //A much more thorough validation would be needed
  if (!req.body.clientId || !req.body.url || !req.body.token) {
    res.status(400).send("There was an issue with your request.");
  } else {
    let client = register(req.body.clientId, req.body.url, req.body.token);

    res.send(
      `${client.clientId} has ${client.webhooks.length} hooks registered.`
    );
  }
});

/**
 * Service for calling all registered webhooks for a
 * specific client.
 *
 * Expects a JSON body such as:
 * {
 *  "clientId": "client 1",
 *  "payload": ["any", {"valid": "payload"}]
 * }
 */
app.post("/api/webhooks/test", (req, res) => {
  let client;

  //validate json body
  //A much more thorough validation would be needed
  if (req.body.clientId) {
    client = clients.find((o) => o.clientId === req.body.clientId);
    if (client instanceof Client) {
      post(client.webhooks, req.body.payload);
      res.status(200).send("OK");
    } else {
      //low information error response
      res.status(400).send("There was an issue with your request.");
    }
  } else {
    //low information error response
    res.status(400).send("There was an issue with your request.");
  }
});

/**
 * This functions loops through an array of type Webhooks
 * and executes a POST request to the url param of each element
 * with the following request body in JSON:
 * {
 *  token: {Webhook.token},
 *  payload: {payload}
 * }
 *
 *
 * @param {*} urlArr
 * @param {*} payload
 */
async function post(urlArr, payload) {
  let axiosReq = [];
  urlArr.forEach((element) => {
    let url = element.url;
    let token = element.token;
    axiosReq.push(
      axios.post(url, {
        token: token,
        payload: payload,
      })
    );
  });
  try {
    //handle the promisses
    let results = await Promise.allSettled(axiosReq);

    //Filter out non successful requests
    let errors = results.filter((o) => {
      return o.status == "rejected";
    });

    //TODO: Handle errors. We need an async data channel. Suggestions:
    //1: Require a report webhook to send reports to
    //2: Email error report to a client email address
    console.log(
      `/api/webhooks/test: ${errors.length} failed attempts out of a total of ${axiosReq.length} request.`
    );
  } catch (error) {
    console.log("/api/webhooks/test " + error);
  }
}

app.listen(port, () => {
  console.log(`server running on ${port}`);
  //initializing tests:
  test.test();
});

//Support methods for test

module.exports.getClient = (clientId) => {
  return clients.find((o) => o.clientId === clientId);
};
