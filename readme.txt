This README file contains additional information on the developed Peakon Webhooks Excercise
solved by Jannik Hendriksen.

The solution is developed in Javascript as a node.js application.
It depends on the following nodejs modules:
axios
express

-- Starting the application --
From the root directory:
node server.js

-- Client identifier assumptions --
I have chosen the assumption that all clients of the system are provided with a client identifier.
I have not implemented this identifier hand-out but implemented a clientId into the JSON request bodies.

-- Token assumptions --
I'm assuming tokens are unique to the webhook and not to the client.

The solution does not implement token verification. This could be done by adding a base64 hash of the request body
to the request header of the webhooks for verification at the client side.
Furthermore, this could be backed up by a Challenge-Response Check pattern where the provider periodically calls the
registered webhooks for a token verification, to ensure consumer identity. 

-- Known issues --
This solution uses HTTP for easy implementation. A webhook solution should use HTTPS along with whitelisting
on the client side.

For simplicity I have chosen a persistence strategy consisting of an array containing Client objects and lookups 
are done by filtering. A production solution would be having a more scalable solution.

-- Testing --
For testing purposes a seperate server running on port 1234 will serve a webhook endpoint at host:1234/hook.
The webhook module is located at "./webhook.js" and will be run automatically when starting the main server. 

A small set of tests have been provided.
They are developed as a seperate module (./test/test.js) and are run by default when starting the server. Output from
these tests will be shown in the console output destination.

A Postman collection of three requests have been provided in the file "./peakon-webhooks.postman_collection.json".
They are for: http://localhost:9876/api/webhook, http://localhost:9876/api/webhook, and http://localhost:1234/hook



