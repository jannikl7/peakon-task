const axios = require("axios");
let lServerAdr, lServerPort, lClientAdr, LClientPort;

function testCallWebhooks(clientId) {
  axios
    .post(`http://${lServerAdr}:${lServerPort}/execute`, {
      clientId: clientId,
      payload: ["any", { valid: "payload" }],
    })
    .then(console.log(`Successfully called `));
}

/**
 * Setup many webhooks on one client.
 * This will also test the availability of the register endpoint
 */
function initClientManyhooks() {
  let initPosts = [];

  //client with many webhooks
  for (let i = 0; i < 100; i++) {
    initPosts.push(
      axios.post(`http://${lServerAdr}:${lServerPort}/register`, {
        clientId: "client 1",
        url: `http://${lClientAdr}:${LClientPort}/hook`,
        token: `mytoken ${i}`,
      })
    );
  }
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
