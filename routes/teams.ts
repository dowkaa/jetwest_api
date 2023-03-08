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
router.get(
  "/resend-onboarding-mail",
  [jwtMiddleWare, signatureSignerMiddleware],
  TeamCtrl.resendOnboardingEmail
);
router.get(
  "/all-users",
  [jwtMiddleWare, signatureSignerMiddleware],
  TeamCtrl.allTeamMembers
);

router.get(
  "/update-team-member",
  [jwtMiddleWare, signatureSignerMiddleware],
  TeamCtrl.addSuperAdmin
);

router.get(
  "/all-transactions",
  [jwtMiddleWare, signatureSignerMiddleware],
  TeamCtrl.viewTransactions
);

router.get(
  "/single-transaction",
  [jwtMiddleWare, signatureSignerMiddleware],
  TeamCtrl.singleTransaction
);

router.get(
  "/all-company-shipments",
  [jwtMiddleWare, signatureSignerMiddleware],
  TeamCtrl.allShipments
);

router.get(
  "/single-shipment",
  [jwtMiddleWare, signatureSignerMiddleware],
  TeamCtrl.singleShipment
);

router.post(
  "/book-shipment",
  [jwtMiddleWare, signatureSignerMiddleware],
  TeamCtrl.bookShipment
);

router.delete(
  "/delete-team-member",
  [jwtMiddleWare, signatureSignerMiddleware],
  TeamCtrl.deleteAdmin
);

module.exports = router;
