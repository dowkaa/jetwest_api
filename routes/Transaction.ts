const exprese = require("express");
require("../config/passport");
const routere = exprese.Router();
const signature = require("../middleware/checkSignature");
const passporte = require("passport");
require("dotenv").config();
const jwtMiddleWaree = passporte.authenticate("jwt", { session: false });

var TransactionsCtrl = require("../controllers/TransactionCtrl");

routere.post(
  "/make-payment",
  [jwtMiddleWaree, signature],
  TransactionsCtrl.paystackPayment
);

routere.post(
  "/inialize-payment",
  [jwtMiddleWaree, signature],
  TransactionsCtrl.initializeTransaction
);

module.exports = routere;
