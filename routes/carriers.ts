const expresed = require("express");
const routerrs = expresed.Router();
require("dotenv").config();
const signatureSigners = require("../middleware/checkSignature");
const passportsz = require("passport");
require("dotenv").config();
const jwtMiddleWars = passportsz.authenticate("jwt", { session: false });

// carriers from controllers
var CarriersCtrl = require("../controllers/CariersCtrl");

routerrs.get(
  "/updates",
  [jwtMiddleWars, signatureSigners],
  CarriersCtrl.estimateData
);

routerrs.get(
  "/all-frieghts",
  [jwtMiddleWars, signatureSigners],
  CarriersCtrl.allFrieghts
);

routerrs.get(
  "/completed-frieghts",
  [jwtMiddleWars, signatureSigners],
  CarriersCtrl.completedFrieghts
);
routerrs.get(
  "/frieghts-in-progress",
  [jwtMiddleWars, signatureSigners],
  CarriersCtrl.FrieghtsEnroute
);

routerrs.get(
  "/all-item-in-flight",
  [jwtMiddleWars, signatureSigners],
  CarriersCtrl.getShipmentsInflight
);

routerrs.get(
  "/get-data",
  [jwtMiddleWars, signatureSigners],
  CarriersCtrl.getData
);

routerrs.post(
  "/add-airway-bill",
  [jwtMiddleWars, signatureSigners],
  CarriersCtrl.addShipmentWayBill
);

module.exports = routerrs;
