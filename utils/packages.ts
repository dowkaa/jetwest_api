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
exports.reset = require("../Mail/resetPassword");
exports.moment = require("moment");
exports.axios = require("axios");
exports.sequelize = require("sequelize");
exports.uuid = require("node-uuid");

// routes
exports.publicRoute = require("../routes/public");
exports.authRouth = require("../routes/auth");
exports.transactions = require("../routes/Transaction");
exports.Webhook = require("../routes/webhook");
exports.carriers = require("../routes/carriers");
exports.password = require("../routes/passwordAuth");
exports.helmet = require("helmet");
exports.jwt = require("jsonwebtoken");
exports.bcrypt = require("bcryptjs");
exports.jwt_decode = require("jwt-decode");

// cron jobs
exports.firstMail = require("../Queues/first_mail");
exports.secondMail = require("../Queues/second_mail");
exports.initialize = require("../Queues/initialize");

// Controller directories
exports.Register = require("../controllers/RegisterCtrl");
exports.LoginCtrl = require("../controllers/LoginCtrl");
exports.HomeCtrl = require("../controllers/HomeCtrl");
exports.paystackQueue = require("../Queues/paystack");

//  Mailers
exports.firstMailer = require("../Mail/firstMail");
exports.secondMailer = require("../Mail/secondMail");
exports.welcome = require("../Mail/welcome");
exports.contactUs = require("../Mail/contactUs");
exports.verify = require("../Mail/verify");
exports.introduction = require("../Mail/Introduction");
exports.verifySuccess = require("../Mail/verifySuccess");
