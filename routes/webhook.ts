const express = require("express");
const routes = express.Router();
require("dotenv").config();

var WebhookCtrl = require("../controllers/WebhookCtrl");

// Authentication
routes.post("/webhook", WebhookCtrl.paystackWebhook);

module.exports = routes;
