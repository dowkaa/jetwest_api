export {};
const express = require("express");
require("../config/passport");
const router = express.Router();
require("dotenv").config();
const { checkKey } = require("../middleware/checkApiKey");
const { personalSignature } = require("../middleware/personalSignature");

var OpenApiCtrl = require("../controllers/OpenAPIsCtrl");

// shipper APIs
router.post(
  "/bookShipment-api",
  [checkKey, personalSignature],
  OpenApiCtrl.bookShipment
);
router.get(
  "/track-shipment-api",
  [checkKey, personalSignature],
  OpenApiCtrl.trackShipments
);
router.get(
  "/all-shipments",
  [checkKey, personalSignature],
  OpenApiCtrl.allShipments
);
router.get(
  "/single-shipment",
  [checkKey, personalSignature],
  OpenApiCtrl.singleShpment
);

// Agent API routes
router.get(
  "/get-incoming-flights",
  [checkKey, personalSignature],
  OpenApiCtrl.getIncomingFlights
);
router.get(
  "/get-outgoing-flights",
  [checkKey, personalSignature],
  OpenApiCtrl.getOutgoingFlights
);

//Carriers API routes
router.get(
  "/dashboard",
  [checkKey, personalSignature],
  OpenApiCtrl.getDashboard
);
router.get(
  "/all-scheduled-flights",
  [checkKey, personalSignature],
  OpenApiCtrl.allFrieghts
);

router.get(
  "/completed-flights",
  [checkKey, personalSignature],
  OpenApiCtrl.completedFrieghts
);
router.get(
  "/flights-enroute",
  [checkKey, personalSignature],
  OpenApiCtrl.FrieghtsEnroute
);

router.get(
  "/all-pending-flights",
  [checkKey, personalSignature],
  OpenApiCtrl.allPendingShipments
);

router.get(
  "/check-flight-availability",
  [checkKey, personalSignature],
  OpenApiCtrl.checkFlightAvailability
);

router.get(
  "/get-shipments-in-flight",
  [checkKey, personalSignature],
  OpenApiCtrl.getShipmentsInflight
);
router.get("data", [checkKey, personalSignature], OpenApiCtrl.getData);

module.exports = router;
