exports.dbs = require("../database/mysql");
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
exports.uuid = require("node-uuid");
exports.publicRoute = require("../routes/public");
exports.authRouth = require("../routes/auth");
// exports.Sequelize = require("sequelize");
exports.helmet = require("helmet");
exports.jwt = require("jsonwebtoken");
exports.bcrypt = require("bcryptjs");
exports.jwt_decode = require("jwt-decode");
exports.welcome = require("../Mail/welcome");
// const expresss = require("express");
// exports.router = express.Router();

exports.Register = require("../controllers/RegisterCtrl");
exports.LoginCtrl = require("../controllers/LoginCtrl");
exports.HomeCtrl = require("../controllers/HomeCtrl");
