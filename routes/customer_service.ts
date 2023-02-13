export {};
const express = require("express");
require("../config/passport");
const router = express.Router();
const signatureSigner = require("../middleware/checkSignature");
const passport = require("passport");
require("dotenv").config();
const jwtMiddleWare = passport.authenticate("jwt", { session: false });
var signatureSignerMiddleware = signatureSigner;

var CustomerService = require("../controllers/CustomerService");

router.get(
  "/all-user-by-type",
  [jwtMiddleWare, signatureSignerMiddleware],
  CustomerService.getAllUsers
);

router.get(
  "/upcoming-shipments",
  [jwtMiddleWare, signatureSignerMiddleware],
  CustomerService.getUserUpcomingShipments
);

router.get(
  "/user-shipments-enroute",
  [jwtMiddleWare, signatureSignerMiddleware],
  CustomerService.getUserShipmentsEnroute
);

router.get(
  "/completed-shipmemts",
  [jwtMiddleWare, signatureSignerMiddleware],
  CustomerService.getUserCompletedShipments
);

router.get(
  "/trackShipment",
  [jwtMiddleWare, signatureSignerMiddleware],
  CustomerService.getAllShipmentsByNum
);

router.get(
  "/single-shipment",
  [jwtMiddleWare, signatureSignerMiddleware],
  CustomerService.singleShipment
);

router.post(
  "/book-customer-shipment",
  [jwtMiddleWare, signatureSignerMiddleware],
  CustomerService.bookCustomerShipment
);

module.exports = router;
