export {};
const express = require("express");
require("../config/passport");
const router = express.Router();
const signatureSigner = require("../middleware/checkSignature");
const passport = require("passport");
require("dotenv").config();
const jwtMiddleWare = passport.authenticate("jwt", { session: false });
var signatureSignerMiddleware = signatureSigner;

var SpaceCtrl = require("../controllers/SpaceCtrl");

router.get(
  "/get-schedule-by-location",
  [jwtMiddleWare, signatureSignerMiddleware],
  SpaceCtrl.getDailyFlightSchedule
);

router.post(
  "/book-space-shipment",
  [jwtMiddleWare, signatureSignerMiddleware],
  SpaceCtrl.bookShipment
);
module.exports = router;
