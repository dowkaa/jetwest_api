export {};
const express = require("express");
require("../config/passport");
const router = express.Router();
const signatureSigner = require("../middleware/checkSignature");
const passport = require("passport");
require("dotenv").config();
const jwtMiddleWare = passport.authenticate("jwt", { session: false });

var AdminCtrl = require("../controllers/AdminsCtrl");

router.post(
  "/create-admin",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.createAdmin
);

router.post(
  "/create-new-role",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.createNewRole
);

router.post(
  "/create-permissions",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.permissions
);

router.post(
  "/change-admin-user-password",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.changePassword
);
router.post(
  "/create-destination",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.createDestination
);

// Aircarfts APIs down

router.get(
  "/recent-cargos",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.allAircrafts
);

router.get(
  "/activate-aircraft",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.activateAircraft
);

router.get(
  "/agent-aircrafts",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.AgentAircrafts
);

router.get(
  "/single-aircraft",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.singleAircraft
);

router.get(
  "/decline-cargos",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.declinedAircrafts
);
module.exports = router;
