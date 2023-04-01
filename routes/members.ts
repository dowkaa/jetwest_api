export {};
const express = require("express");
require("../config/passport");
const router = express.Router();
const signatureSigner = require("../middleware/checkSignature");
const passport = require("passport");
require("dotenv").config();
const jwtMiddleWare = passport.authenticate("jwt", { session: false });
var signatureSignerMiddleware = signatureSigner;
const signature = require("../middleware/personalSignature");

var MembersCtrl = require("../controllers/MembersCtrl");

router.post(
  "/book-shpment",
  [signature.personalSignature],
  MembersCtrl.bookShipping
);
router.post(
  "/send-customer-mail",
  [signature.personalSignature],
  MembersCtrl.sendPartiesMail
);
router.post(
  "/confirm-shipment",
  [signature.personalSignature],
  MembersCtrl.confirmShipment
);
router.post(
  "/make-payment",
  [signature.personalSignature],
  MembersCtrl.makePayment
);
module.exports = router;
