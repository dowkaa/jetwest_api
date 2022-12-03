import { NextFunction, Response, Request } from "express";
const db = require("../database/mysql");
const util = require("../utils/packages");
require("dotenv").config();

let paystack_key: any;

if (process.env.STATE === "dev") {
  paystack_key = process.env.PAYSTACK_TEST_SECRET_KEY;
} else {
  paystack_key = process.env.PAYSTACK_LIVE_SECRET_KEY;
}

module.exports = {
  paystackWebhook: async (req: any, res: Response, next: NextFunction) => {
    // initialiseOpay.processJob(option);

    try {
      await db.Webhook.create({
        ip: req.clientIp,
        type: "paystack",
        body: JSON.stringify(req.body),
      });
    } catch (e) {}

    // const allowed_ip = ['52.31.139.75', '52.49.173.169', '52.214.14.220', '::1'];
    // //console.log(req.clientIp);

    // if(!allowed_ip.includes(req.clientIp))
    // {
    //     return res.sendStatus(200);
    // }

    var secret = paystack_key;
    //validate event
    var hash = util.crypto
      .createHmac("sha512", secret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    //if (hash == req.headers["x-paystack-signature"]) {
    // Retrieve the request's body
    var event = req.body;
    // Do something with event
    // console.log(event)
    var reference = event.data.reference;
    var validateTransaction = await util.helpers.checkUserTransaction(
      reference
    );

    console.log("9876546789876==========");

    if (validateTransaction) {
      console.log("got here");
      return res.sendStatus(200);
    } else {
      if (event.data.status == "success") {
        // console.log("got here 2")
        var amount = event.data.amount / 100;
        // var charges = Charges(amount);
        //var charges = parseFloat(amount);
        //amount = amount - Number(charges);
        let checker = await db.Transaction.findOne({
          where: { reference: reference },
        });

        if (checker) {
          return res.sendStatus(200);
        }

        var user = await db.User.findOne({
          where: { email: event.data.customer.email },
        });

        try {
          await db.Transaction.create({
            uuid: util.uuid,
            user_id: user.customer_id,
            amount: amount,
            reference: reference,
            type: "credit",
            method: "paystack",
            status: "success",
            description: "Fund account via Paystack",
          });
        } catch (e) {}

        return res.sendStatus(200);
      } else {
        return res.sendStatus(200);
      }
    }
  },
};
