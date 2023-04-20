// const express = require('express');
export {};
require("dotenv").config();
require("./database/mysql");
const utils = require("./utils/packages");
const port = process.env.PORT;

// https://stackoverflow.com/questions/41194368/how-to-get-all-sundays-mondays-tuesdays-between-two-dates

// const publicRoute = require('./routes/public')
const server = require("./utils/server");
const app = server.createServer();
const http = require("http").Server(app);

module.exports = http.listen(port || 2023, () => {
  console.log(`Server started on port ${port}`);

  console.log({ caches: utils.appCache.get("chats") });
  // let date = utils.moment().add(1, "hour").format("YYYY-MM-DD HH:mm:ss");
});
