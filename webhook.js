// ------ This module provide functionallity to simulate a client webhook ------------

const express = require("express");

let app = express();
app.use(express.json());

const port = 1234;

/**
 * Service simulating a client webhook
 * This implementation expects the following JSON request body
 * {
 *  token: token,
 *  payload: payload
 * }
 *
 * and will return:
 *
 * {
 *  timestamp: Date.now()
 * }
 */
app.post("/hook", (req, res) => {
  res.send({
    timestamp: Date.now(),
  });
});

app.listen(port, () =>
  console.log(`Webhook listening on http://localhost:${port}/hook`)
);
