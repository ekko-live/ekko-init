const express = require("express");
const app = express();
const port = 3000;
const Ekko = require("ekko-realtime-client");
const ekko = new Ekko({
  host: "myEkkoServerEndpoint",
  jwt: "myAppJWT",
  appName: "express-demo",
  uuid: "myUniqueUUID",
});

ekko.subscribe({ channels: ["greeting"] });
ekko.addListener({
  message: (ekkoEvent) => {
    addMessage(ekkoEvent);
  },
  status: (ekkoEvent) => {
    addStatus(ekkoEvent);
  },
  presence: (ekkoEvent) => {
    addStatus(ekkoEvent);
  },
});

let counter = 0;
setInterval(() => {
  ekko.publish({
    channel: "greeting",
    message: { text: `Hello world! ${counter}` },
  });

  counter++;
}, 3000);

const logger = (params) => {
  console.log();
  Object.entries(params).forEach(([key, value]) => {
    console.log(`${key}: ${value}`);
  });
};

// Ekko Callbacks
const addMessage = ({ channel, message, uuid }) => {
  logger({
    Message: message.text,
    Channel: channel,
    UUID: uuid,
  });
};

const addStatus = ({ uuid, admin, app, event }) => {
  logger({
    Status: event,
    App: app,
    Admin: admin,
    UUID: uuid,
  });
};

const addPresence = ({ uuid, admin, app, event }) => {
  logger({
    Presence: event,
    App: app,
    Admin: admin,
    UUID: uuid,
  });
};

app.get("/", (req, res) => {
  res.send("Open server console to see ekko events");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
