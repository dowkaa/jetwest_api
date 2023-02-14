// database
exports.dbs = require("../database/mysql");

// libraries/packages
exports.express = require("express");
exports.session = require("express-session");
exports.helpers = require("../config/helpers");
exports.cors = require("cors");
exports.cookieParser = require("cookie-parser");
exports.bodyParser = require("body-parser");
exports.passport = require("passport");
exports.passportJWT = require("passport-jwt");
exports.Joi = require("joi");
exports.cryptoJS = require("crypto-js");
exports.crypto = require("crypto");
exports.reset = require("../Mail/resetPassword");
exports.moment = require("moment");
exports.axios = require("axios");
exports.generateApiKey = require("generate-api-key").default;
exports.sequelize = require("sequelize");
exports.uuid = require("node-uuid");

// routes
exports.publicRoute = require("../routes/public");
exports.authRouth = require("../routes/auth");
exports.transactions = require("../routes/Transaction");
exports.Webhook = require("../routes/webhook");
exports.carriers = require("../routes/carriers");
exports.password = require("../routes/passwordAuth");
exports.CustomerRoutes = require("../routes/customer_service");
exports.admin = require("../routes/admin");
exports.helmet = require("helmet");
exports.jwt = require("jsonwebtoken");
exports.bcrypt = require("bcryptjs");
exports.jwt_decode = require("jwt-decode");

// cron jobs
exports.firstMail = require("../Queues/first_mail");
exports.secondMail = require("../Queues/second_mail");
exports.scheduleItem = require("../Queues/schedule_item");
exports.transactionValidate = require("../Queues/transaction_validate");
exports.allShipments = require("../Queues/all_shipments");
exports.updateShipment = require("../Queues/update_shipment");
exports.updateScheduled = require("../Queues/update_scheduled_flight");
exports.initialize = require("../Queues/initialize");

// Controller directories
exports.Register = require("../controllers/RegisterCtrl");
exports.LoginCtrl = require("../controllers/LoginCtrl");
exports.HomeCtrl = require("../controllers/HomeCtrl");
exports.CustomerService = require("../controllers/CustomerService");
exports.paystackQueue = require("../Queues/paystack");

//  Mailers
exports.firstMailer = require("../Mail/firstMail");
exports.secondMailer = require("../Mail/secondMail");
exports.welcome = require("../Mail/welcome");
exports.contactUs = require("../Mail/contactUs");
exports.verify = require("../Mail/verify");
exports.groundHandlerMail = require("../Mail/groundHandler");
exports.adminBook = require("../Mail/adminBook");
exports.agent = require("../Mail/agent");
exports.reciever = require("../Mail/receiver");
exports.aircraftUpdate = require("../Mail/aircraftUpdate");
exports.introduction = require("../Mail/Introduction");
exports.changeAdminPassword = require("../Mail/changeAdminPassword");
exports.welcome_admin = require("../Mail/welcome_admin");
exports.adminUpdate = require("../Mail/adminUpdate");
exports.verifySuccess = require("../Mail/verifySuccess");
// http://35.184.239.130:4044/auth/forgot-password/change-password/75693a1dcdc412346b16153bb2cc4471296d742c8f1ea1c6b38dbea721f5e9b5
