export {};
import { Request, Response, NextFunction } from "express";
const util = require("../utils/packages");
const { Op } = require("sequelize");
const db = require("../database/mysql");
const sms = require("../services/sms");
const { paginate } = require("paginate-info");

module.exports = {
  bookShipping: async (req: any, res: Response, next: NextFunction) => {
    const itemSchema = util.Joi.object()
      .keys({
        items: util.Joi.array().required(),
        pickup_location: util.Joi.string().required(),
        destination: util.Joi.string().required(),
        total_weight: util.Joi.number().required(),
        stod: util.Joi.string().required(),
        agent_id: util.Joi.string().allow(""),
        first_name: util.Joi.string().required(),
        cargo_type: util.Joi.array().required(),
        last_name: util.Joi.string().required(),
        agreement: util.Joi.boolean().required(),
        mobile: util.Joi.string().required(),
        address: util.Joi.string().required(),
        country: util.Joi.string().required(),
        email: util.Joi.string().required(),
        reciever_firstname: util.Joi.string().required(),
        reciever_lastname: util.Joi.string().required(),
        reciever_email: util.Joi.string().required(),
        reciever_primaryMobile: util.Joi.string().required(),
        reciever_organisation: util.Joi.string().required(),
        sender_organisation: util.Joi.string().required(),
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
        shipment_ref: util.Joi.string().required(),
        width: util.Joi.number().required(),
        length: util.Joi.number().required(),
        weight: util.Joi.number().required(),
        height: util.Joi.number().required(),
        depature_date: util.Joi.string().required(),
        cargo_type: util.Joi.string().required(),
        category: util.Joi.string().allow(""),
        promo_code: util.Joi.string().allow(""),
        value: util.Joi.number().required(),
        content: util.Joi.string().required(),
        invoice_url: util.Joi.array().allow(""),
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
      depature_date,
      pickup_location,
      destination,
      stod,
      total_weight,
      agent_id,
      payment_ref,
      agreement,
      reciever_organisation: reciever_organisation,
      sender_organisation: sender_organisation,
      reciever_email,
      reciever_firstname,
      reciever_lastname,
      reciever_primaryMobile,
      first_name,
      last_name,
      mobile,
      address,
      country,
      email,
    } = req.body;

    var code = util.helpers.generateClientId(6);
    var customer_id = util.helpers.generateClientId(10);

    let checker = await db.dbs.Users.findOne({
      where: {
        mobile_number: mobile,
        first_name: first_name,
        last_name: last_name,
        country: country,
        email: email,
      },
    });

    if (!agreement) {
      return res
        .status(400)
        .json(
          util.helpers.sendError(
            "Terms and Conditions of shipping agreements must be accepted"
          )
        );
    }
    let user;

    if (!checker) {
      user = await db.dbs.Users.create({
        customer_id,
        uuid: util.uuid(),
        mobile_number: mobile,
        company_name: address,
        first_name,
        last_name,
        reg_status: "completed",
        country,
        email,
      });
    } else {
      user = checker;
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

    // if (payment_ref) {
    //   var validateTransaction = await util.helpers.checkUserTransaction(
    //     payment_ref
    //   );

    //   if (validateTransaction) {
    //     return res
    //       .status(400)
    //       .json(util.helpers.sendError("Transaction reference already logged"));
    //   }
    // }

    // let payment_methods = ["verto", "paystack", "receipt"];

    // if (!payment_methods.includes(payment_type)) {
    //   return res
    //     .status(400)
    //     .json(
    //       util.helpers.sendError(
    //         "Kindly use a valid payment method either verto, paystack or receipt"
    //       )
    //     );
    // }

    let v = await db.dbs.ScheduleFlights.findOne({
      where: {
        departure_station: pickup_location,
        destination_station: destination,
        stod: stod,
      },
    });

    if (!v) {
      return res
        .status(400)
        .json(
          util.helpers.sendError(
            "Flight not available, kindly check up other flights with other stod, or reduce the number of items to be shipped for this flight"
          )
        );
      // if no available flight then save the data to a table for pending luggage and sent mail to admin that will
    }

    let arr = JSON.parse(v.departure_date);

    if (!arr.includes(items[0].depature_date)) {
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

    if (parseFloat(v.available_capacity) < parseInt(total_weight)) {
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

    for (const item of items) {
      let price;
      let insurance;
      const {
        width,
        height,
        weight,
        length,
        shipment_ref,
        category,
        ba_code_url,
        promo_code,
        cargo_type,
        depature_date,
        value,
        content,
        invoice_url,
      } = item;

      let route = await db.dbs.ShipmentRoutes.findOne({
        where: { destination_name: destination },
      });

      if (!route) {
        return res.status(400).json(util.helpers.sendError("Route not found"));
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
        v.totalAmount =
          parseFloat(v.totalAmount) +
          price * parseFloat(route.dailyExchangeRate);
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
        v.totalAmount =
          parseFloat(v.totalAmount) +
          price * parseFloat(route.dailyExchangeRate);
        await v.save();
      }

      price = price * parseFloat(route.dailyExchangeRate);

      if (agent_id) {
        let agent = await db.dbs.Users.findOne({ where: { uuid: agent_id } });
        let status = await db.dbs.ShippingItems.create({
          uuid: util.uuid(),
          flight_id: v.id,
          type: null,
          user_id: user.id,
          agent_id: agent.id,
          shipment_num,
          reference: payment_ref,
          value,
          pickup_location,
          chargeable_weight,
          cargo_id: cargo.id,
          stod: items[0].depature_date + " " + stod,
          destination,
          depature_date: depature_date.split("/").reverse().join("-"),
          width,
          length: length,
          height,
          insurance,
          sur_charge: price * (parseFloat(route.sur_charge) / 100),
          taxes: price * (parseFloat(route.tax) / 100),
          booking_type: "Personal",
          status: "pending",
          shipment_routeId: route.id,
          scan_code,
          weight,
          ratePerKg: route.ratePerKg,
          logo_url: v.logo_url,
          arrival_date: v.arrival_date,
          booking_reference: shipment_ref,
          volumetric_weight,
          company_name: user.company_name,
          payment_status: "pending",
          shipment_model: "select",
          price: price,
          reciever_organisation: reciever_organisation,
          sender_organisation: sender_organisation,
          category,
          cargo_index: cargo_type,
          ba_code_url,
          promo_code: promo_code ? promo_code : null,
          shipperName: user.first_name + " " + user.last_name,
          organisation: user.organisation,
          shipperNum: user.customer_id,
          no_of_bags: items.length,
          content,
          reciever_firstname,
          reciever_lastname,
          reciever_email,
          reciever_primaryMobile,
        });

        if (invoice_url) {
          if (agent_id && invoice_url.length > 0) {
            await db.dbs.ShipmentInvoives.create({
              uuid: util.uuid(),
              user_id: user.id,
              invoice_url: JSON.stringify(invoice_url),
              shipment_id: status.id,
            });
          }
        }
      } else {
        let status = await db.dbs.ShippingItems.create({
          uuid: util.uuid(),
          flight_id: v.id,
          type: null,
          user_id: user.id,
          shipment_num,
          reference: payment_ref,
          cargo_index: cargo_type,
          value,
          pickup_location,
          chargeable_weight,
          stod: items[0].depature_date + " " + stod,
          cargo_id: cargo.id,
          destination,
          reciever_organisation: reciever_organisation,
          sender_organisation: sender_organisation,
          depature_date: depature_date.split("/").reverse().join("-"),
          width,
          length: length,
          height,
          insurance,
          sur_charge: price * (parseFloat(route.sur_charge) / 100),
          taxes: price * (parseFloat(route.tax) / 100),
          book_type: "Personal",
          status: "pending",
          shipment_routeId: route.id,
          scan_code,
          weight,
          ratePerKg: route.ratePerKg,
          logo_url: v.logo_url,
          arrival_date: v.arrival_date,
          booking_reference: shipment_ref,
          volumetric_weight,
          company_name: user.company_name,
          payment_status: "pending",
          shipment_model: "select",
          price: price,
          category,
          ba_code_url,
          promo_code: promo_code ? promo_code : null,
          shipperName: user.first_name + " " + user.last_name,
          organisation: user.organisation,
          shipperNum: user.customer_id,
          no_of_bags: items.length,
          content,
          reciever_firstname,
          reciever_lastname,
          reciever_email,
          reciever_primaryMobile,
        });
        if (invoice_url) {
          if (agent_id && invoice_url.length > 0) {
            await db.dbs.ShipmentInvoives.create({
              uuid: util.uuid(),
              user_id: user.id,
              invoice_url: JSON.stringify(invoice_url),
              shipment_id: status.id,
            });
          }
        }
      }
    }

    v.no_of_bags = parseInt(v.no_of_bags) + items.length;
    await v.save();

    const option = {
      shipment_num,
    };

    util.helpers.bookingExpiry(option);

    // if (status) {
    return res.status(200).json(
      util.helpers.sendSuccess({
        message:
          "Shipment booked successfully, kindly proceed to make payment as booked shipment would expire after 30 minutes.",
        shipment_num,
      })
    );
    // }
  },

  makePayment: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const itemSchema = util.Joi.object()
      .keys({
        payment_ref: util.Joi.string().allow(""),
        payment_type: util.Joi.string().required(),
        amount: util.Joi.string().allow(""),
        mobile: util.Joi.string().required(),
        shipment_num: util.Joi.string().required(),
        first_name: util.Joi.string().required(),
        last_name: util.Joi.string().required(),
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

    const {
      payment_ref,
      shipment_num,
      amount,
      payment_doc_url,
      payment_type,
      first_name,
      mobile,
      last_name,
    } = req.body;

    let user = await db.dbs.Users.findOne({
      where: {
        first_name: first_name,
        last_name: last_name,
        mobile_number: mobile,
      },
    });

    if (!user) {
      return res
        .status(400)
        .json(util.helpers.sendError("Customer details not found"));
    }

    const option = {
      reference: payment_ref,
      shipment_num,
      id: user.id,
      company_name: user.company_name,
      amount,
      payment_doc_url,
      user: user,
      customer_id: user.customer_id,
    };

    let shipment = await db.dbs.ShippingItems.findOne({
      where: { shipment_num: shipment_num },
    });

    if (!shipment) {
      return res
        .status(400)
        .json(
          util.helpers.sendError("Shipment number not recognised by system")
        );
    }

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

      await db.dbs.ShippingItems.update(
        { reference: payment_ref },
        {
          where: {
            shipment_num: shipment_num,
          },
        }
      );

      util.helpers.validateTransaction(option, "members");
      util.helpers.checkBaggageConfirmation(option);

      let tracker = util.helpers.generateReftId(5);
      const expiredAt = new Date();

      await db.dbs.ShipmentTracker.create({
        uuid: util.uuid(),
        shipment_id: shipment.id,
        track_num: tracker,
        expiredAt: new Date(
          expiredAt.setTime(expiredAt.getTime() + 15 * 60 * 1000)
        ).toUTCString(),
      });

      const opt = {
        email: user.email,
        name: first_name + " " + last_name,
        shipment_num: shipment_num,
        message: `Dear esteemed customer, kindly use the id ${tracker} to to confirm receipt of your shipment`,
        tracking_id: tracker,
      };

      util.tag.sendMail(opt);
      sms.send(shipment.reciever_primaryMobile, opt.message);

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

      let tracker = util.helpers.generateReftId(5);
      const expiredAt = new Date();

      await db.dbs.ShipmentTracker.create({
        uuid: util.uuid(),
        shipment_id: shipment.id,
        track_num: tracker,
        expiredAt: new Date(
          expiredAt.setTime(expiredAt.getTime() + 15 * 60 * 1000)
        ).toUTCString(),
      });

      const opt = {
        email: user.email,
        name: first_name + " " + last_name,
        shipment_num: shipment_num,
        message: `Dear esteemed customer, kindly use the id ${tracker} to to confirm receipt of your shipment`,
        tracking_id: tracker,
      };

      util.tag.sendMail(opt);
      sms.send(user.mobile, opt.message);

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
  },

  sendPartiesMail: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const itemSchema = util.Joi.object()
      .keys({
        pickup_location: util.Joi.string().required(),
        destination: util.Joi.string().required(),
        shipment_num: util.Joi.string().required(),
        agent_id: util.Joi.string().allow(""),
        email: util.Joi.string().required(),
        address: util.Joi.string().required(),
        reciever_firstname: util.Joi.string().required(),
        reciever_lastname: util.Joi.string().required(),
        reciever_email: util.Joi.string().required(),
        reciever_organisation: util.Joi.string().required(),
        reciever_primaryMobile: util.Joi.string().required(),
        reciever_secMobile: util.Joi.string().allow(""),
      })
      .unknown();

    const validate1 = itemSchema.validate(req.body);

    if (validate1.error != null) {
      const errorMessage = validate1.error.details
        .map((i: any) => i.message)
        .join(".");
      return res.status(400).json(util.helpers.sendError(errorMessage));
    }

    const {
      pickup_location,
      destination,
      total_weight,
      agent_id,
      shipment_num,
      email,
      address,
      reciever_firstname,
      reciever_lastname,
      reciever_email,
      reciever_organisation,
      reciever_primaryMobile,
      reciever_secMobile,
    } = req.body;

    let agent = await db.dbs.Users.findOne({ where: { uuid: agent_id } });

    if (!agent) {
      return res.status(400).json(util.helpers.sendError("Agent not found"));
    }

    const option = {
      departure: pickup_location,
      destination,
      total_weight,
      shipment_num,
      agent_email: agent.email,
      agent_first_name: agent.first_name,
      agent_last_name: agent.last_name,
      agent_mobile: agent.mobile,
      agent_company: agent.company_name,
      email,
      address,
      reciever_firstname,
      reciever_lastname,
      reciever_email,
      reciever_organisation,
      reciever_primaryMobile,
      reciever_secMobile,
    };

    util.customerMail.sendMail(option);

    return res
      .status(200)
      .json(util.helpers.sendSuccess("Email sent successfully"));
  },

  confirmShipment: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const schema = util.Joi.object()
      .keys({
        otp: util.Joi.string().required(),
      })
      .unknown();

    const validate = schema.validate(req.body);

    if (validate.error != null) {
      const errorMessage = validate.error.details
        .map((i: any) => i.message)
        .join(".");
      return res.status(200).json(util.helpers.sendSuccess(errorMessage));
    }

    let { otp } = req.body;

    let verifyToken = await db.dbs.ShipmentTracker.findOne({
      where: { expiredAt: otp, is_used: 0 },
    });

    if (!verifyToken) {
      return res
        .status(400)
        .json(
          util.helpers.sendError(
            "Invalid confirmation token sent or token already used"
          )
        );
    }

    let shipments = await db.dbs.ShippingItems.findOne({
      where: { id: verifyToken.shipment_id },
    });

    if (!shipments) {
      return res.status(400).json(util.helpers.sendError("No shipment found"));
    }

    if (Date.parse(verifyToken.expiredAt) < new Date().getTime()) {
      return res.status(400).json({
        status: "ERROR",
        code: "01",
        message: "Shipment confirmation token expired",
      });
    }

    await db.dbs.ShippingItems.update(
      { is_confirmed: true },
      {
        where: {
          shipment_num: shipments.shipment_num,
        },
      }
    );

    verifyToken.is_used = 1;
    await verifyToken.save();

    return res
      .status(200)
      .json(util.helpers.sendSuccess("Shpments confirmation successful"));
  },
};
