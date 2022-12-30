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

router.post(
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
  "/all-admins",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.allAdmins
);

router.get("/all-roles", [jwtMiddleWare, signatureSigner], AdminCtrl.allRoles);

router.get(
  "/non-paginated-roles",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.nonPaginatedRoles
);

router.get(
  "/decline-cargos",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.declinedAircrafts
);

router.get(
  "/activated-cargos",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.activatedAircrafts
);

router.get(
  "/all-permissions",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.allPermissions
);

router.post(
  "/update-admin",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.updateAdmin
);

// schedule flights

router.post(
  "/schedule-flight",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.scheduleFlights
);

router.get(
  "/all-scheduled-flights",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.allScheduledFlights
);

router.get(
  "/flights-in-progress",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.flightsInProgress
);

router.get(
  "/completed-flights",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.flightsCompleted // allAircraftReports
);

router.get(
  "/single-flight",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.singleFlight
);
// aircraft reports
router.get(
  "/all-aircraft-reports",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.allAircraftReports
);

router.get(
  "/single-aircraft-report",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.singleAircraftReport
);

router.post(
  "/add-aircraft-report",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.addAirAudit
);

router.get(
  "/delete-aircraft",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.deleteAircraft
);

// compliance
// shippers
router.get(
  "/all-shippers",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.allShippers
);

router.get(
  "/activated-shippers",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.allActivatedShippers
);

router.get(
  "/declined-shippers",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.allDeclinedShippers
);

// carriers
router.get(
  "/all-carriers",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.allCarriers
);

router.get(
  "/activated-carriers",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.allActivatedCarriers
);

router.get(
  "/declined-carriers",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.allDeclinedCarriers
);

// Agents
router.get(
  "/all-agents",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.allAgents
);

router.get(
  "/activated-agents",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.allActivatedAgents
);

router.get(
  "/declined-agents",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.allDeclinedAgents
);

router.post(
  "/activate-deactiave-users",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.activateDeactivateUser
);

router.get(
  "/delete-user",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.deleteUser
);
module.exports = router;
