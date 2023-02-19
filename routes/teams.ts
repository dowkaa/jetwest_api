export {};
const express = require("express");
require("../config/passport");
const router = express.Router();
const signatureSigner = require("../middleware/checkSignature");
const passport = require("passport");
require("dotenv").config();
const jwtMiddleWare = passport.authenticate("jwt", { session: false });
var signatureSignerMiddleware = signatureSigner;

var TeamCtrl = require("../controllers/TeamsCtrl");

router.post(
  "/add-team-member",
  [jwtMiddleWare, signatureSignerMiddleware],
  TeamCtrl.createTeam
);

module.exports = router;
