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
  AdminCtrl.allAircrafts // done
);

router.post(
  "/activate-aircraft",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.activateAircraft
);

router.get(
  "/agent-aircrafts",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.AgentAircrafts // done
);

router.get(
  "/single-aircraft",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.singleAircraft // done
);

router.get(
  "/all-admins",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.allAdmins // done
);

router.get("/all-roles", [jwtMiddleWare, signatureSigner], AdminCtrl.allRoles); // done

router.get(
  "/non-paginated-roles",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.nonPaginatedRoles // done
);

router.get(
  "/decline-cargos",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.declinedAircrafts // done
);

router.get(
  "/activated-cargos",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.activatedAircrafts // done
);

router.get(
  "/all-permissions",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.allPermissions // done
);

router.post(
  "/update-admin",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.updateAdmin
);

router.get("/all-unpaginated-aircrafts", AdminCtrl.unpaginatedAircrafts); // done

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
  AdminCtrl.allScheduledFlights // done
);

router.get(
  "/flights-in-progress",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.flightsInProgress // done
);

router.get(
  "/completed-flights",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.flightsCompleted // done
);

router.get(
  "/single-flight",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.singleFlight // done
);
// aircraft reports
router.get(
  "/all-aircraft-reports",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.allAircraftReports // done
);

router.get(
  "/single-aircraft-report",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.singleAircraftReport // done
);

router.post(
  "/add-aircraft-report",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.addAirAudit
);

router.get(
  "/delete-aircraft",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.deleteAircraft //
);

// compliance
// shippers
router.get(
  "/all-shippers",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.allShippers // done
);

router.get(
  "/activated-shippers",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.allActivatedShippers // done
);

router.get(
  "/declined-shippers",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.allDeclinedShippers // done
);

// carriers
router.get(
  "/all-carriers",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.allCarriers //done
);

router.get(
  "/activated-carriers",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.allActivatedCarriers // done
);

router.get(
  "/declined-carriers",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.allDeclinedCarriers // done
);

// Agents
router.get(
  "/all-agents",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.allAgents // done
);

router.get(
  "/activated-agents",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.allActivatedAgents // done
);

router.get(
  "/declined-agents",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.allDeclinedAgents // done
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
  AdminCtrl.allShipmentRoutes // done
);

router.get("/unpaginated-destinations", AdminCtrl.allDestinations); // done
// logistics
router.get(
  "/all-shipments",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.allShipments // done
);
router.get(
  "/single-shipment",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.singleShipment // done
);
router.get(
  "/pending-shipment",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.pendingShipments //done
);
router.get(
  "/enroute-shipments",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.enrouteShipments // done
);

router.get(
  "/completed-shipments",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.completedShipments // done
);

router.get(
  "/almost-completed-flights",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.almostCompletedShipments // done
);

router.get("/all-users", [jwtMiddleWare, signatureSigner], AdminCtrl.allUsers); // done
router.post(
  "/update-user-note",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.addUserNote
);
router.get(
  "/single-user",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.singleUser // done
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
  AdminCtrl.allRoutes // done
);

router.get(
  "/delete-route",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.deleteRoute
);
router.get(
  "/single-route",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.singleRoute // done
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

router.post(
  "/update-exchange-rate",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.updateRate
);

// logistics ops
router.get(
  "/all-loaded-bags",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.allLoadedBags
);

router.get(
  "/filter-loaded-bags",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.filterLoadedBags
);

router.get(
  "/all-offloaded-bags",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.allOffLoadedBags
);

router.get(
  "/filter-offloaded-bags",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.filterOffloadedBags
);

router.get(
  "/pending-flights",
  [jwtMiddleWare, signatureSigner],
  AdminCtrl.pendingFlights
);
module.exports = router;
