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

  let date = utils.moment("2023-04-11T16:49:22.278Z").format("YYYY-MM-DD");
  let now = utils.moment().format("YYYY-MM-DD");

  if (date < now) {
    console.log("hello world");
  }
  // let date = utils.moment().add(1, "hour").format("YYYY-MM-DD HH:mm:ss");
});
