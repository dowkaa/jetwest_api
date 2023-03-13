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

routerr.get(
  "/my-cargos",
  [jwtMiddleWare, signatureSignerMiddleware],
  AuthenticatedCtrl.myCargos
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
  "/trackShipment",
  [jwtMiddleWare, signatureSignerMiddleware],
  AuthenticatedCtrl.trackShipment
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
  "/searchShipment",
  [jwtMiddleWare, signatureSignerMiddleware],
  AuthenticatedCtrl.searchShipment
);

routerr.get(
  "/completed-agent-shipmemts",
  [jwtMiddleWare, signatureSignerMiddleware],
  AuthenticatedCtrl.completedAgentShipments
);

routerr.get(
  "/transaction-shipments",
  [jwtMiddleWare, signatureSignerMiddleware],
  AuthenticatedCtrl.shipmentsFromTransactions
);

routerr.get(
  "/shipper-update",
  [jwtMiddleWare, signatureSignerMiddleware],
  AuthenticatedCtrl.getUpdate
);

routerr.get(
  "/pending-payments",
  [jwtMiddleWare, signatureSignerMiddleware],
  AuthenticatedCtrl.pendingPayments
);

routerr.post(
  "/make-payment",
  [jwtMiddleWare, signatureSignerMiddleware],
  AuthenticatedCtrl.makePayment
);

routerr.post(
  "/add-payment-proof",
  [jwtMiddleWare, signatureSignerMiddleware],
  AuthenticatedCtrl.addPaymentProof
);

routerr.get(
  "/get-payment-proof-docs",
  [jwtMiddleWare, signatureSignerMiddleware],
  AuthenticatedCtrl.viewPaymentProofs
);

module.exports = routerr;
