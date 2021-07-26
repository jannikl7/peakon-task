const express = require("express");

let app = express();
app.use(express.json());

const port = 1234;

app.post("/hook", (req, res) => {
  console.log(
    `Hook requested with token: ${req.body.token} and payload: ${res.body.payload}`
  );
  res.send({
    timestamp: Date.now(),
  });
});

app.listen(port, () =>
  console.log(`Webhook listening on http://localhost:${port}/hook`)
);
