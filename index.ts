// const express = require('express');
export {};
require("dotenv").config();
require("./database/mysql");
const utils = require("./utils/packages");
const port = process.env.PORT;

// const publicRoute = require('./routes/public')
const server = require("./utils/server");
const app = server.createServer();
const http = require("http").Server(app);

module.exports = http.listen(port || 2023, () => {
  console.log(`Server started on port ${port}`);
  // let date = utils.moment().add(1, "hour").format("YYYY-MM-DD HH:mm:ss");
  let date = utils.moment("2023-5-7 12:00:00").format("YYYY-MM-DD HH:mm:ss");

  console.log({
    date: new Date(),
    moment: date,
  });
});
