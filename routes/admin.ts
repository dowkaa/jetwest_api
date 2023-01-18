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

router.get("/all-unpaginated-aircrafts", AdminCtrl.unpaginatedAircrafts);

// schedule flights

router.post(
  "/schedule-flight",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.scheduleFlights
);

router.post(
  "/update-scheduled-flight",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.updateScheduledFlight
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
//0599554110 gtb
router.get(
  "/all-destinations",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.allShipmentRoutes
);

router.get("/unpaginated-destinations", AdminCtrl.allDestinations);
// logistics
router.get(
  "/all-shipments",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.allShipments
);
router.get(
  "/single-shipment",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.singleShipment
);
router.get(
  "/pending-shipment",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.pendingShipments
);
router.get(
  "/enroute-shipments",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.enrouteShipments
);

router.get(
  "/completed-shipments",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.completedShipments
);

router.get(
  "/almost-completed-flights",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.almostCompletedShipments
);

router.get("/all-users", [jwtMiddleWare, signatureSigner], AdminCtrl.allUsers);
router.post(
  "/update-user-note",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.addUserNote
);
router.get(
  "/single-user",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.singleUser
);

// routes

router.post(
  "/create-route",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.createRoute
);

router.post(
  "/update-route",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.updateRoute
);
router.get(
  "/all-routes",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.allRoutes
);

router.get(
  "/delete-route",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.deleteRoute
);
router.get(
  "/single-route",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.singleRoute
);

// update flight
router.post(
  "/update-atd",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.updateATD
);

router.post(
  "/update-blockTime",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.updateBlockTime
);

// logistics
router.get(
  "/all-outgoing-logistics",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.allOutgoingLogistics
);

router.get(
  "/all_incoming_logistics",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.allIncomingLogistics
);

router.get(
  "/scan-bag",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.scanBaggage
);
module.exports = router;
