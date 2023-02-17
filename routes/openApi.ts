export {};
const express = require("express");
require("../config/passport");
const router = express.Router();
const passport = require("passport");
require("dotenv").config();
const { checkKey } = require("../middleware/checkApiKey");

var OpenApiCtrl = require("../controllers/OpenAPIsCtrl");

// shipper APIs
router.post("/bookShipment-api", [checkKey], OpenApiCtrl.bookShipment);

router.get("/track-shipment-api", [checkKey], OpenApiCtrl.trackShipments);

// Agent API routes
router.get("/get-incoming-flights", [checkKey], OpenApiCtrl.getIncomingFlights);

router.get("/get-outgoing-flights", [checkKey], OpenApiCtrl.getOutgoingFlights);

//Carriers API routes
router.get("/dashboard", [checkKey], OpenApiCtrl.getDashboard);

router.get("/all-scheduled-flights", [checkKey], OpenApiCtrl.allFrieghts);

router.get("/completed-flights", [checkKey], OpenApiCtrl.completedFrieghts);

router.get("/flights-enroute", [checkKey], OpenApiCtrl.FrieghtsEnroute);

router.get(
  "/get-shipments-in-flight",
  [checkKey],
  OpenApiCtrl.getShipmentsInflight
);

router.get("data", [checkKey], OpenApiCtrl.getData);

module.exports = router;
