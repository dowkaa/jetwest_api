const exprez = require("express");
const routers = exprez.Router();
require("dotenv").config();
const signatureSignerMiddlewares = require("../middleware/checkSignature");
const passport = require("passport");
require("dotenv").config();
const jwtMiddleWares = passport.authenticate("jwt", { session: false });

const PasswordCtrl = require("../controllers/PasswordCtrl");
const Auth = require("../controllers/Authenticated");

// Authentication
routers.get("/forgot-password", PasswordCtrl.forgotPassword);
routers.post("/validate-otp", PasswordCtrl.validatePasswordReset);
routers.post(
  "/reset-password",
  [jwtMiddleWares, signatureSignerMiddlewares],
  Auth.resetPassword
);
module.exports = routers;
