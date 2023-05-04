import { NextFunction, Response, Request } from "express";
const db = require("../database/mysql");
const util = require("../utils/packages");
require("dotenv").config();

let paystack_key: any;

if (process.env.ENV === "test") {
  paystack_key = process.env.PAYSTACK_TEST_SECRET_KEY;
} else {
  paystack_key = process.env.PAYSTACK_LIVE_SECRET_KEY;
}

module.exports = {
  paystackWebhook: async (req: any, res: Response, next: NextFunction) => {
    try {
      await db.dbs.Webhook.create({
        ip: req.clientIp,
        type: "paystack",
        body: JSON.stringify(req.body),
      });

      var secret = paystack_key;
      //validate event
      var hash = util.crypto
        .createHmac("sha512", process.env.PAYSTACK_KEY)
        .update(JSON.stringify(req.body))
        .digest("hex");

      if (hash == req.headers["x-paystack-signature"]) {
        var event = req.body;
        var reference = event.data.reference;
        var validateTransaction = await util.helpers.checkUserTransaction(
          reference
        );

        console.log({ event });

        let shipment = await db.dbs.ShippingItems.findOne({
          where: { reference: reference },
        });

        if (!shipment) {
          console.log(
            `*************************************** no shipment with reference ${reference} found`
          );
          return res.sendStatus(200);
        }

        let route = await db.dbs.ShipmentRoutes.findOne({
          where: { id: shipment.route_id },
        });

        if (validateTransaction) {
          return res.sendStatus(200);
        } else {
          if (event.data.status == "success") {
            var amount = event.data.amount / 100;
            let checker = await db.dbs.Transactions.findOne({
              where: { reference: reference },
            });

            if (checker) {
              return res.sendStatus(200);
            }

            var user = await db.Users.findOne({
              where: { email: event.data.customer.email },
            });

            await db.dbs.Transactions.create({
              uuid: util.uuid(),
              user_id: user.id,
              amount_in_dollars: amount / parseFloat(route.dailyExchangeRate),
              amount_in_local_currency: amount,
              reference: reference,
              departure: shipment.pickup_location,
              arrival: shipment.destination,
              booked_by: shipment.shipperName,
              amount_deducted: amount / parseFloat(route.dailyExchangeRate),
              cargo_id: shipment.cargo_id,
              rate: parseFloat(route.dailyExchangeRate),
              departure_date: shipment.depature_date,
              arrival_date: shipment.arrival_date,
              shipment_no: shipment.shipment_num,
              company_name: user.company_name,
              weight:
                parseFloat(shipment.volumetric_weight) >
                parseFloat(shipment.weight)
                  ? shipment.volumetric_weight
                  : shipment.weight,
              reciever_organisation: shipment.reciever_organisation,
              pricePerkeg: shipment.ratePerKg,
              no_of_bags: shipment.no_of_bags,
              type: "credit",
              method: "paystack webhook",
              description: `Payment for shipment with no ${shipment.shipment_num} via paystack webhook`,
              status: "success",
              airwaybill_cost: parseFloat(route.air_wayBill_rate),
              total_cost: amount / parseFloat(route.dailyExchangeRate),
            });

            await db.dbs.ShippingItems.update(
              { payment_status: "SUCCESS" },
              {
                where: {
                  reference: reference,
                },
              }
            );

            return res.sendStatus(200);
          } else {
            await db.dbs.ShippingItems.update(
              { payment_status: "FAILED" },
              {
                where: {
                  reference: reference,
                },
              }
            );
          }
        }
        return res.sendStatus(200);
      }
      return res.sendStatus(400);
    } catch (err: any) {
      console.log({ err, message: err.response });
      await db.dbs.PaystackError.create({
        uuid: util.uuid(),
        reference: reference,
        data: JSON.stringify(err.response.data),
      });
    }
  },
};
