const axios = require("axios");
let lServerAdr, lServerPort, lClientAdr, LClientPort;

function testCallWebhooks(clientId) {
  let endpoint = `http://${lServerAdr}:${lServerPort}/api/webhooks/test`;
  axios
    .post(endpoint, {
      clientId: clientId,
      payload: ["any", { valid: "payload" }],
    })
    .then(console.log(`Successfully called ${endpoint}`))
    .catch((error) => {
      console.error(`An error occured while calling ${endpoint}: ${error}`);
    });
}

/**
 * Setup two client with many webhooks.
 * This will also test the availability of the register endpoint
 */
function initClientManyhooks() {
  let initPosts = [];

  //client with many webhooks
  for (let i = 0; i < 100; i++) {
    initPosts.push(
      axios.post(`http://${lServerAdr}:${lServerPort}/api/webhooks`, {
        clientId: "client " + (i % 2),
        url: `http://${lClientAdr}:${LClientPort}/hook`,
        token: `mytoken ${i}`,
      })
    );
  }

  initPosts.push(
    axios.post(`http://${lServerAdr}:${lServerPort}/api/webhooks`, {
      clientId: "client 1",
      url: `http://${lClientAdr}:${LClientPort}/wrong`,
      token: `mytoken ${100}`,
    })
  );

  axios
    .all(initPosts)
    .then((results) => {
      console.log(`Test initialization done: ${results}`);
    })
    .catch((error) => {
      console.warn(`Could not initialize for testing!!!`);
    });
}

module.exports.init = (serverAdr, serverPort, clientAdr, clientPort) => {
  lServerAdr = serverAdr;
  lServerPort = serverPort;
  lClientAdr = clientAdr;
  LClientPort = clientPort;
  initClientManyhooks();
};
