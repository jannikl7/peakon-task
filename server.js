const express = require("express");
const axios = require("axios");
const testinit = require("./test-init");

let app = express();
app.use(express.json());
let port = 9876;

//since focus is not on persistence I will
//prioritize ease of implementation vs. performance
//for storing the webhooks. An implementation of HashMap or similar
//would make this solution faster at scale.
var clients = [];

class Client {
  webhooks = [];
  constructor(clientId) {
    this.clientId = clientId;
  }
}

class Webhook {
  constructor(url, token) {
    this.url = url;
    this.token = token;
  }
}

function register(clientId, url, token) {
  let client = clients.find((o) => o.clientId === clientId);
  if (!(client instanceof Client)) {
    client = new Client(clientId);
    clients.push(client);
  }

  client.webhooks.push(new Webhook(url, token));

  return client;
}

app.post("/register", (req, res) => {
  //check json body

  let client = register(req.body.clientId, req.body.url, req.body.token);

  res.send(
    `${client.clientId} has ${client.webhooks.length} hooks registered.`
  );
});

app.post("/execute", (req, res) => {
  //check json body
  //get webhooks for token
  //call each webhook
  //avoid DND attacks?

  let client = clients.find((o) => o.clientId === req.body.clientId);
  if (client instanceof Client) {
    res.write(`Calling Webhooks for: ${client.clientId}`);
    post(client.webhooks, res.body.payload);
    res.end();
  } else {
    //low information error response
    res.status(400).send("There was an issue with your request.");
  }
});

/**
 * This functions loops through an array of type Webhooks
 * and and executes a POST request to the url param of each element
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
function post(urlArr, payload) {
  let axiosReq = [];
  urlArr.forEach((element) => {
    console.log("creating requests");
    let url = element.url;
    let token = element.token;
    axiosReq.push(
      axios.post(url, {
        token: token,
        payload: payload,
      })
    );
  });

  axios
    .all(axiosReq)
    .then((results) => {
      //I do not expect any results from the result Array
      console.log(`Webhook results: ${results}`);
    })
    .catch((error) => {
      console.error(`ERROR: ${error}`);
    });
}

app.listen(port, () => {
  console.log(`server running on ${port}`);

  //initialize for tests:
  testinit.init("localhost", 9876, "localhost", 1234);
});
