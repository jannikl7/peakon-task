//----------- This module provides a few tests for the Peakon Webhook Exercise -----------

let axios = require("axios");
const server = require("../server");
const webhook = require("../webhook");

/**
 * Testing the /api/webhook service
 */
async function testRegister(clientId) {
  console.log("TESTING /api/webhooks");
  let initPosts = [];
  console.log("Registering 100 webhooks with 4 invalid endpoints on client 1");
  console.log("Registering 20 webhooks with 2 invalid endpoints on client 2");
  for (let i = 0; i < 100; i++) {
    //client 1 will have 4 webhooks with an unreachable endpoint
    initPosts.push(
      axios.post(server.register_endpoint, {
        clientId: "client 1",
        url:
          i % 30 == 0
            ? "http://localhost:1234/wrong"
            : "http://localhost:1234/hook",
        token: "mytoken1",
      })
    );

    if (i % 5 == 0) {
      //client 2 will have 2 webhooks with an unreachable endpoint
      initPosts.push(
        axios.post(server.register_endpoint, {
          clientId: "client 2",
          url:
            i % 50 == 0
              ? "http://localhost:1234/wrong"
              : "http://localhost:1234/hook",
          token: "mytoken1",
        })
      );
    }
  }

  try {
    let result = await axios.all(initPosts);

    console.log(
      "\nChecking for registered webhooks directly on storage object:"
    );
    console.log(
      `Expecting 100 webhooks on Client 1 - result is: ${
        server.getClient("client 1").webhooks.length
      }`
    );
    console.log(
      `Expecting 20 webhooks on Client 2 - result is: ${
        server.getClient("client 2").webhooks.length
      }`
    );
    return result;
  } catch (error) {
    console.error(error);
  }
}

/**
 * testing /api/webhook with a bad request body.
 */
async function testBadRequests() {
  try {
    let regReq = await axios.post(server.register_endpoint, {
      bad: "request",
    });
  } catch (error) {
    console.log(`Expecting response code 400. Received error: ${error}`);
  }
}

/**
 * Testing the /api/webhook/test service
 */
async function testRegisteredWebhooks(clientId) {
  try {
    let returnval = await axios.post(server.call_endpoint, {
      clientId: clientId,
      payload: ["any", { valid: "payload" }],
    });

    // log statements will come from server.js
  } catch (error) {
    console.error("TEST 'RegisteredWebhooks' failed! " + error);
  }
}

module.exports.test = async () => {
  console.log("\n------TEST---------");
  // tests /api/webhooks:
  await testRegister();

  //test /api/webhooks with bad request body
  console.log("\nTESTING /api/webhooks with bad request body");
  await testBadRequests();

  // test /api/webhooks/test
  console.log("\nTESTING /api/webhooks/test");
  console.log("expecting 4 failures on client 1 and 2 failures on client 2");
  await testRegisteredWebhooks("client 1");
  await testRegisteredWebhooks("client 2");
};
