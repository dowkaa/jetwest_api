const expressss = require("express");
require("../config/passport");
const routerr = expressss.Router();
const signatureSigner = require("../middleware/checkSignature");
const passportsss = require("passport");
require("dotenv").config();
const jwtMiddleWare = passportsss.authenticate("jwt", { session: false });
var signatureSignerMiddleware = signatureSigner;

var AuthenticatedCtrl = require("../controllers/AuthenticatedCtrl");

routerr.get(
  "/get-profile",
  [jwtMiddleWare, signatureSignerMiddleware],
  AuthenticatedCtrl.getProfile
);

routerr.post(
  "/update-agent",
  [jwtMiddleWare, signatureSignerMiddleware],
  AuthenticatedCtrl.updatedShipmentAgent
);

routerr.post(
  "/edit-shipment",
  [jwtMiddleWare, signatureSignerMiddleware],
  AuthenticatedCtrl.editShipment
);

routerr.post(
  "/request_quote",
  [jwtMiddleWare, signatureSignerMiddleware],
  AuthenticatedCtrl.requestQuote
);

routerr.post(
  "/book_shipment",
  [jwtMiddleWare, signatureSignerMiddleware],
  AuthenticatedCtrl.bookShipping
);

routerr.post(
  "/add_cargo",
  [jwtMiddleWare, signatureSignerMiddleware],
  AuthenticatedCtrl.addCargo
);

// shipments
routerr.get(
  "/upcoming-shipments",
  [jwtMiddleWare, signatureSignerMiddleware],
  AuthenticatedCtrl.upcomingShipments
);

routerr.get(
  "/all-shipments",
  [jwtMiddleWare, signatureSignerMiddleware],
  AuthenticatedCtrl.getAllShipments
);

routerr.get(
  "/shipment-byQR",
  [jwtMiddleWare, signatureSignerMiddleware],
  AuthenticatedCtrl.getShipmentItem
);

routerr.get(
  "/shipments-enroute",
  [jwtMiddleWare, signatureSignerMiddleware],
  AuthenticatedCtrl.enRouteShipments
);

routerr.get(
  "/completed-shipments",
  [jwtMiddleWare, signatureSignerMiddleware],
  AuthenticatedCtrl.completedShipments
);

// agents
routerr.get(
  "/agent-upcoming-shipments",
  [jwtMiddleWare, signatureSignerMiddleware],
  AuthenticatedCtrl.upcomingAgentShipment
);

routerr.get(
  "/agent-shipments-enroute",
  [jwtMiddleWare, signatureSignerMiddleware],
  AuthenticatedCtrl.AgentShipmentEnroute
);

routerr.get(
  "/searchUpComing",
  [jwtMiddleWare, signatureSignerMiddleware],
  AuthenticatedCtrl.searchUpComing
);

routerr.get(
  "/completed-agent-shipmemts",
  [jwtMiddleWare, signatureSignerMiddleware],
  AuthenticatedCtrl.completedAgentShipments
);

module.exports = routerr;
