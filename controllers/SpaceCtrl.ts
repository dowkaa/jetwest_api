export {};
import { Request, Response, NextFunction } from "express";
const util = require("../utils/packages");
const { Op, QueryTypes } = require("sequelize");
const db = require("../database/mysql");
const { paginate } = require("paginate-info");

module.exports = {
  getDailyFlightSchedule: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    let { departure_station, destination_station } = req.query;

    if (!departure_station && !destination_station) {
      return res
        .status(400)
        .json(
          util.helpers.sendError(
            "Kindly add a departure airport and a destination airport to your request"
          )
        );
    }

    let schedule_flights = await db.dbs.ScheduleFlights.findAll({
      where: {
        departure_station: departure_station,
        destination_station: destination_station,
        available_capacity: {
          [Op.gt]: 0,
        },
      },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({ schedule_flights });
  },

  bookShipment: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const itemSchema = util.Joi.object()
      .keys({
        items: util.Joi.array().required(),
        pickup_location: util.Joi.string().required(),
        destination: util.Joi.string().required(),
        cargo_type: util.Joi.array().required(),
        total_weight: util.Joi.number().required(),
        stod: util.Joi.string().required(),
        agent_id: util.Joi.string().allow(""),
        reciever_firstname: util.Joi.string().required(),
        reciever_lastname: util.Joi.string().required(),
        reciever_email: util.Joi.string().required(),
        reciever_organisation: util.Joi.string().required(),
        reciever_primaryMobile: util.Joi.string().required(),
        reciever_secMobile: util.Joi.string().allow(""),
        payment_ref: util.Joi.string().allow(""),
        payment_type: util.Joi.string().required(),
        amount: util.Joi.string().allow(""),
        payment_doc_url: util.Joi.string().allow(""),
      })
      .unknown();

    const validate1 = itemSchema.validate(req.body);

    if (validate1.error != null) {
      const errorMessage = validate1.error.details
        .map((i: any) => i.message)
        .join(".");
      return res.status(400).json(util.helpers.sendError(errorMessage));
    }

    const bookingSchema = util.Joi.object()
      .keys({
        type: util.Joi.string().required(),
        depature_date: util.Joi.string().required(),
        shipment_ref: util.Joi.string().required(),
        width: util.Joi.number().required(),
        length: util.Joi.number().required(),
        weight: util.Joi.number().required(),
        height: util.Joi.number().required(),
        category: util.Joi.string().allow(""),
        cargo_type: util.Joi.string().required(),
        promo_code: util.Joi.string().allow(""),
        value: util.Joi.number().required(),
        content: util.Joi.string().required(),
        ba_code_url: util.Joi.string().allow(""),
      })
      .unknown();

    const validate = bookingSchema.validate(req.body.items[0]);

    if (validate.error != null) {
      const errorMessage = validate.error.details
        .map((i: any) => i.message)
        .join(".");
      return res.status(400).json(util.helpers.sendError(errorMessage));
    }

    const {
      items,
      pickup_location,
      destination,
      stod,
      total_weight,
      agent_id,
      payment_ref,
      reciever_email,
      reciever_firstname,
      reciever_lastname,
      reciever_organisation,
      reciever_primaryMobile,
      reciever_secMobile,
      payment_type,
      amount,
      payment_doc_url,
    } = req.body;

    let user = await db.dbs.Users.findOne({ where: { uuid: req.user.uuid } });

    if (!user) {
      return res.status(400).json(util.helpers.sendError("User not found"));
    }

    if (amount && parseFloat(amount) < 0) {
      return res
        .status(400)
        .json(util.helpers.sendError("Amount cannot be negative"));
    }

    let shipment_num = util.helpers.generateReftId(10);
    let scan_code = util.helpers.generateReftId(10);

    if (agent_id) {
      let checker = await db.dbs.Users.findOne({ where: { uuid: agent_id } });

      if (!checker) {
        return res.status(400).json(util.helpers.sendError("Agent not found"));
      }
    }

    let checkShipment = await db.dbs.ShippingItems.findOne({
      where: { shipment_num },
    });

    if (checkShipment) {
      shipment_num = util.helpers.generateReftId(10);
    }

    if (payment_ref) {
      var validateTransaction = await util.helpers.checkUserTransaction(
        payment_ref
      );

      if (validateTransaction) {
        return res
          .status(400)
          .json(util.helpers.sendError("Transaction reference already logged"));
      }
    }

    let payment_methods = ["verto", "paystack", "receipt"];

    if (!payment_methods.includes(payment_type)) {
      return res
        .status(400)
        .json(
          util.helpers.sendError(
            "Kindly use a valid payment method either verto, paystack or receipt"
          )
        );
    }

    let schedule = await db.dbs.ScheduleFlights.findOne({
      where: {
        departure_station: pickup_location,
        destination_station: destination,
        stod: stod,
      },
    });

    if (!schedule) {
      return res
        .status(400)
        .json(
          util.helpers.sendError(
            "Flight not available, kindly check up other flights with other stod, or reduce the number of items to be shipped for this flight"
          )
        );
      // if no available flight then save the data to a table for pending luggage and sent mail to admin that will
    }

    let v = await util.helpers.getValue(
      schedule,
      user,
      pickup_location,
      destination,
      items
    );

    //  let arr = JSON.parse(v.departure_date);

    if (v.departure_date !== items[0].depature_date) {
      return res
        .status(400)
        .json(
          util.helpers.sendError(
            `Scheduled flight not available for the departure date entered kindly reschedule for another departure date`
          )
        );
    }

    if (
      Date.parse(items[0].depature_date + " " + stod) - new Date().getTime() <=
      1079999
    ) {
      return res
        .status(400)
        .json(
          util.helpers.sendError(
            "Flight not available for booking, already in transit"
          )
        );
    }

    if (parseFloat(v.available_capacity) - parseInt(total_weight) < 0) {
      return res
        .status(400)
        .json(
          util.helpers.sendError(
            "Flight not availbale to carry total weight, kindly book another flight or contact customer support"
          )
        );
    }

    if (parseFloat(v.available_capacity) <= 0) {
      return res
        .status(400)
        .json(
          util.helpers.sendError(
            "Flight not availbale to carry total weight, kindly book another flight or contact customer support"
          )
        );
    }

    if (
      Date.parse(items[0].depature_date + " " + stod) - new Date().getTime() <=
      1079999
    ) {
      return res
        .status(400)
        .json(
          util.helpers.sendError(
            "Flight not available for booking, already in transit"
          )
        );
    }

    if (v.status !== "pending") {
      return res
        .status(400)
        .json(util.helpers.sendError("Flight not available"));
    }

    let cargo = await db.dbs.Cargo.findOne({
      where: { flight_reg: v.flight_reg },
    });

    if (!cargo) {
      return res
        .status(400)
        .json(
          util.helpers.sendError(
            `Aircraft with flight registration number ${v.flight_reg} not found.`
          )
        );
    }

    for (const item of req.body.cargo_type) {
      if (cargo.cargo_types) {
        if (!JSON.parse(cargo.cargo_types).includes(item)) {
          return res
            .status(400)
            .json(
              util.helpers.sendError(
                `Aircraft not allowed to carry ${item}, kindly use select or contact support.`
              )
            );
        }
      } else {
        return res
          .status(400)
          .json(util.helpers.sendError(`Aircraft does not have cargo types.`));
      }
    }

    let route = await db.dbs.ShipmentRoutes.findOne({
      where: { destination_name: destination, type: "space" },
    });

    if (!route) {
      return res.status(400).json(util.helpers.sendError("Route not found"));
    }

    for (const item of items) {
      let price;
      let insurance;
      const {
        type,
        width,
        height,
        weight,
        length,
        shipment_ref,
        cargo_type,
        category,
        ba_code_url,
        promo_code,
        depature_date,
        value,
        content,
      } = item;

      if (
        parseFloat(width) < 0 ||
        parseFloat(height) < 0 ||
        parseFloat(length) < 0 ||
        parseFloat(weight) < 0
      ) {
        return res
          .status(400)
          .json(
            util.helpers.sendError(
              `width, height, weight, and length must be greater than zero`
            )
          );
      }

      let chargeable_weight;
      let volumetric_weight =
        (parseInt(width) * parseInt(height) * parseInt(length)) / 5000;

      chargeable_weight =
        volumetric_weight > parseInt(weight)
          ? volumetric_weight
          : parseInt(weight);

      if (category === "fragile") {
        price = chargeable_weight * parseFloat(route.ratePerKg);
        let price1 = price * (parseFloat(route.sur_charge) / 100);
        let price2 = price * (parseFloat(route.tax) / 100);
        let price3 = value * (parseFloat(route.insurance) / 100);
        insurance = price3;
        let totalPrice = price + price1 + price2 + price3;
        price = totalPrice;
      } else {
        price = chargeable_weight * parseFloat(route.ratePerKg);
        let price1 = price * (parseFloat(route.sur_charge) / 100);
        let price2 = price * (parseFloat(route.tax) / 100);
        let totalPrice = price + price1 + price2;
        price = totalPrice;
      }

      if (parseInt(weight) > volumetric_weight) {
        if (parseFloat(v.available_capacity) - parseFloat(weight) < 0) {
          return res
            .status(400)
            .json(
              util.helpers.sendError(
                "Cannot book shipment aircraft capacity not enough"
              )
            );
        }
        v.available_capacity =
          parseFloat(v.available_capacity) - parseFloat(weight);
        v.totalAmount = parseFloat(v.totalAmount) + price;
        v.taw = parseFloat(v.taw) + parseFloat(weight);
        await v.save();
      } else {
        if (parseFloat(v.available_capacity) - volumetric_weight < 0) {
          return res
            .status(400)
            .json(
              util.helpers.sendError(
                "Cannot book shipment aircraft capacity not enough"
              )
            );
        }

        v.available_capacity =
          parseFloat(v.available_capacity) - parseFloat(weight);
        v.taw = parseFloat(v.taw) + parseFloat(weight);
        v.totalAmount = parseFloat(v.totalAmount) + price;
        await v.save();
      }
      let shipment_model = "space";

      util.helpers.addShipment(
        req,
        price,
        item,
        v,
        route,
        insurance,
        chargeable_weight,
        shipment_num,
        cargo,
        scan_code,
        volumetric_weight,
        shipment_model,
        user,
        null,
        null,
        null
      );

      v.no_of_bags = parseInt(v.no_of_bags) + 1;
      await v.save();
    }

    console.log("111111111111111111");
    util.helpers.updateScheduleTotal(v.uuid, route.uuid, shipment_num);
    // v.no_of_bags = parseInt(v.no_of_bags) + items.length;
    // await v.save();

    const option = {
      reference: payment_ref,
      shipment_num,
      id: req.user.id,
      company_name: req.user.company_name,
      customer_id: req.user.customer_id,
      amount,
      payment_doc_url,
      user: req.user,
      route_id: route.uuid,
    };

    if (payment_type === "paystack") {
      if (!payment_ref) {
        return res
          .status(400)
          .json(
            util.helpers.sendError(
              "Kindly add a valid paystack payment reference to validate your payment."
            )
          );
      }
      util.helpers.validateTransaction(option, "payment");
      util.helpers.checkBaggageConfirmation(option);

      return res
        .status(200)
        .json(
          util.helpers.sendSuccess(
            "Shipment booked successfully, the Dowkaa team would reach out to you soon."
          )
        );
    } else if (payment_type === "receipt") {
      if (!(payment_doc_url && amount)) {
        return res
          .status(400)
          .json(
            util.helpers.sendError(
              "You need to fill the amount and payment_doc_url if you want to make payment via transfer and reciept upload. "
            )
          );
      }
      util.helpers.paymentForShipmentBookingByReceipt(option);

      return res
        .status(200)
        .json(util.helpers.sendSuccess("Document uploaded successfully"));
    } else {
      return res
        .status(400)
        .json(
          util.helpers.sendError(
            "Payment method not available, kindly proceed to pending payments to payments to make payment"
          )
        );
    }

    // let response = await util.helpers.validateTransaction(option, "payment");
    // util.helpers.checkBaggageConfirmation(option);

    // if (status) {
    return res.status(200).json(util.helpers.sendSuccess());
  },
};
