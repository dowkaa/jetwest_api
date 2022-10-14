"use strict";
// const express = require('express');
require("dotenv").config();
require("./database/mysql");
const port = process.env.PORT;
const d = require("./database/mysql");
// const publicRoute = require('./routes/public')
const server = require("./utils/server");
const app = server.createServer();
const http = require("http").Server(app);
module.exports = http.listen(port || 2023, () => {
    console.log(`Server started on port ${port}`);
});
