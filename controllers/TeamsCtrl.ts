export {};
import { NextFunction, response, Response } from "express";
const db = require("../database/mysql");
const utill = require("../utils/packages");

module.exports = {
  // company admin creates users theme
  createTeam: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const schema = utill.Joi.object()
      .keys({
        type: utill.Joi.string().required(),
        team_type: utill.Joi.string().required(),
        first_name: utill.Joi.string().required(),
        last_name: utill.Joi.string().required(),
        country: utill.Joi.string().required(),
        email: utill.Joi.string().required(),
        mobile: utill.Joi.string().required(),
      })
      .unknown();

    const validate = schema.validate(req.body);

    if (validate.error != null) {
      const errorMessage = validate.error.details
        .map((i: any) => i.message)
        .join(".");
      return res.status(400).json(utill.helpers.sendError(errorMessage));
    }

    let checkMail = await utill.helpers.checkMail(req);
    let checkMobile = await utill.helpers.checkMobile(req);

    if (checkMail) {
      return res
        .status(400)
        .json(utill.helpers.sendError("User with email already exists"));
    }

    if (checkMobile) {
      return res
        .status(400)
        .json(
          utill.helpers.sendError("User with mobile number already exists")
        );
    }

    const { first_name, last_name, country, email, mobile, type } = req.body;

    let user = await db.dbs.Users.findOne({ where: { uuid: req.user.uuid } });

    if (!user) {
      return res.status(400).json(utill.helpers.sendError("User not found"));
    }
    var customer_id = utill.helpers.generateClientId(10);
    var password = utill.helpers.generateReftId(6);

    await db.dbs.Users.create({
      team_id: type,
      customer_id,
      uuid: utill.uuid(),
      mobile_number: mobile,
      first_name,
      last_name,
      verification_status: "completed",
      reg_status: "completed",
      activated: 1,
      country,
      password: utill.bcrypt.hashSync(password),
      email,
      company_name: user.company_name,
      organisation: user.organisation,
      profileDoc: user.profileDoc,
      company_address: user.company_address,
      companyFounded: user.companyFounded,
    });

    const option = {
      name: first_name + " " + last_name,
      email: email,
      message: `You have been added to your ${user.company_name} company's dowkaa account as a ${type}. Kindly use the password below to login and access your company dashboard. Thanks`,
      password,
    };

    utill.teamWelcome.sendMail(option);

    return res
      .status(200)
      .json(utill.helpers.sendSuccess("User created successfully"));
  },

  fundWallet: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    // finance

    return res.status(200).json(utill.helpers.sendSuccess("success"));
  },

  viewTransactions: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    // finance

    let user = await db.dbs.Users.findOne({ where: { uuid: req.user.uuid } });

    if (user.type !== "Admin" || user.type !== "finance") {
      return res
        .status(400)
        .json(utill.helpers.sendError("You don't have access to this API "));
    }

    let transactions = await db.dbs.Transactions.findAll({
      where: { company_name: user.company_name },
    });

    return res.status(200).json({ transactions });
  },

  singleTransaction: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    // finance
    let transaction_id = req.query.transaction_id;

    if (!transaction_id) {
      return res
        .status(400)
        .json(utill.helpers.sendError("Kindly add a valid transaction id"));
    }

    let user = await db.dbs.Users.findOne({ where: { uuid: req.user.uuid } });

    if (user.type !== "Admin" || user.type !== "finance") {
      return res
        .status(400)
        .json(utill.helpers.sendError("You don't have access to this API "));
    }

    let transaction = await db.dbs.Transactions.findOne({
      where: { uuid: transaction_id },
    });

    return res.status(200).json({ transaction });
  },

  allShipments: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    let user = await db.dbs.Users.findOne({ where: { uuid: req.user.uuid } });

    let shipments = await db.dbs.ShippingItems.findAll({
      where: { company_name: user.company_name },
    });

    return res.status(200).json({ shipments });
  },

  singleShipment: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    let shipment_id = req.query.shipment_id;

    if (!shipment_id) {
      return res
        .status(400)
        .json(utill.helpers.sendError("Kindly add a valid shipment id"));
    }

    let shipment = await db.dbs.ShippingItems.findOne({
      where: { uuid: shipment_id },
    });

    return res.status(200).json({ shipment });
  },

  bookShipment: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const itemSchema = utill.Joi.object()
      .keys({
        items: utill.Joi.array().required(),
        pickup_location: utill.Joi.string().required(),
        payment_ref: utill.Joi.string().required(),
        destination: utill.Joi.string().required(),
        total_weight: utill.Joi.number().required(),
        stod: utill.Joi.string().required(),
        agent_id: utill.Joi.string().allow(""),
        reciever_firstname: utill.Joi.string().required(),
        reciever_lastname: utill.Joi.string().required(),
        reciever_email: utill.Joi.string().required(),
        reciever_organisation: utill.Joi.string().required(),
        reciever_primaryMobile: utill.Joi.string().required(),
        reciever_secMobile: utill.Joi.string().allow(""),
      })
      .unknown();

    const validate1 = itemSchema.validate(req.body);

    if (validate1.error != null) {
      const errorMessage = validate1.error.details
        .map((i: any) => i.message)
        .join(".");
      return res.status(400).json(utill.helpers.sendError(errorMessage));
    }

    const bookingSchema = utill.Joi.object()
      .keys({
        type: utill.Joi.string().required(),
        depature_date: utill.Joi.string().required(),
        shipment_ref: utill.Joi.string().required(),
        width: utill.Joi.number().required(),
        length: utill.Joi.number().required(),
        weight: utill.Joi.number().required(),
        height: utill.Joi.number().required(),
        category: utill.Joi.string().allow(""),
        promo_code: utill.Joi.string().allow(""),
        value: utill.Joi.number().required(),
        content: utill.Joi.string().required(),
        ba_code_url: utill.Joi.string().allow(""),
      })
      .unknown();

    const validate = bookingSchema.validate(req.body.items[0]);

    if (validate.error != null) {
      const errorMessage = validate.error.details
        .map((i: any) => i.message)
        .join(".");
      return res.status(400).json(utill.helpers.sendError(errorMessage));
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
    } = req.body;

    let shipment_num = utill.helpers.generateReftId(10);
    let scan_code = utill.helpers.generateReftId(10);

    if (agent_id) {
      let checker = await db.dbs.Users.findOne({ where: { uuid: agent_id } });

      if (!checker) {
        return res.status(400).json(utill.helpers.sendError("Agent not found"));
      }
    }

    let checkShipment = await db.dbs.ShippingItems.findOne({
      where: { shipment_num },
    });

    if (checkShipment) {
      shipment_num = utill.helpers.generateReftId(10);
    }

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
          utill.helpers.sendError(
            "Flight not available, kindly check up other flights with other stod, or reduce the number of items to be shipped for this flight"
          )
        );
      // if no available flight then save the data to a table for pending luggage and sent mail to admin that will
    }

    if (v.available_capacity < parseInt(total_weight)) {
      return res
        .status(400)
        .json(
          utill.helpers.sendError(
            "Flight not availbale to carry total weight, kindly book another flight or contact customer support"
          )
        );
    }

    if (Date.parse(stod) - new Date().getTime() <= 1079999) {
      return res
        .status(400)
        .json(
          utill.helpers.sendError(
            "Flight not available for booking, already in transit"
          )
        );
    }

    if (v.status !== "pending") {
      return res
        .status(400)
        .json(utill.helpers.sendError("Flight not available"));
    }

    for (const item of items) {
      let price;
      const {
        type,
        width,
        height,
        weight,
        length,
        shipment_ref,
        category,
        ba_code_url,
        promo_code,
        depature_date,
        value,
        content,
      } = item;

      let route = await db.dbs.ShipmentRoutes.findOne({
        where: { destination_name: destination },
      });

      if (!route) {
        return res.status(400).json(utill.helpers.sendError("Route not found"));
      }

      let cargo = await db.dbs.Cargo.findOne({
        where: { flight_reg: v.flight_reg },
      });

      if (!cargo) {
        return res
          .status(400)
          .json(
            utill.helpers.sendError(
              `Aircraft with flight registration number ${v.flight_reg} not found`
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
        let price1 = price * parseFloat(route.sur_charge);
        let price2 = price * parseFloat(route.tax);
        let price3 = value * parseFloat(route.insurance);
        let totalPrice = price + price1 + price2 + price3;
        price = totalPrice;
      } else {
        price = chargeable_weight * parseFloat(route.ratePerKg);
        let price1 = price * parseFloat(route.sur_charge);
        let price2 = price * parseFloat(route.tax);
        let totalPrice = price + price1 + price2;
        price = totalPrice;
      }

      if (parseInt(weight) > volumetric_weight) {
        if (parseFloat(v.available_capacity) - parseFloat(weight) < 0) {
          return res
            .status(400)
            .json(
              utill.helpers.sendError(
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
              utill.helpers.sendError(
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

      price = price * parseFloat(route.dailyExchangeRate);

      if (agent_id) {
        let agent = await db.dbs.Users.findOne({ where: { uuid: agent_id } });
        let status = await db.dbs.ShippingItems.create({
          uuid: utill.uuid(),
          flight_id: v.id,
          type,
          user_id: req.user.id,
          agent_id: agent.id,
          shipment_num,
          reference: payment_ref,
          value,
          pickup_location,
          chargeable_weight,
          cargo_id: cargo.id,
          destination,
          depature_date: depature_date.split("/").reverse().join("-"),
          width,
          length: length,
          height,
          sur_charge: route.sur_charge,
          taxes: route.tax,
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
          company_name: req.user.company_name,
          payment_status: "pending",
          price: price,
          category,
          ba_code_url,
          promo_code: promo_code ? promo_code : null,
          shipperName: req.user.first_name + " " + req.user.last_name,
          organisation: req.user.organisation,
          shipperNum: req.user.customer_id,
          no_of_bags: items.length,
          content,
          reciever_firstname,
          reciever_lastname,
          reciever_email,
          reciever_organisation,
          reciever_primaryMobile,
          reciever_secMobile,
        });
      } else {
        let status = await db.dbs.ShippingItems.create({
          uuid: utill.uuid(),
          flight_id: v.id,
          type,
          user_id: req.user.id,
          shipment_num,
          reference: payment_ref,
          value,
          pickup_location,
          chargeable_weight,
          cargo_id: cargo.id,
          destination,
          depature_date: depature_date.split("/").reverse().join("-"),
          width,
          length: length,
          height,
          sur_charge: route.sur_charge,
          taxes: route.tax,
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
          company_name: req.user.company_name,
          payment_status: "pending",
          price: price,
          category,
          ba_code_url,
          promo_code: promo_code ? promo_code : null,
          shipperName: req.user.first_name + " " + req.user.last_name,
          organisation: req.user.organisation,
          shipperNum: req.user.customer_id,
          no_of_bags: items.length,
          content,
          reciever_firstname,
          reciever_lastname,
          reciever_email,
          reciever_organisation,
          reciever_primaryMobile,
          reciever_secMobile,
        });
      }
    }

    v.no_of_bags = parseInt(v.no_of_bags) + items.length;
    await v.save();

    const option = {
      reference: payment_ref,
      shipment_num,
      id: req.user.id,
      company_name: req.user.company_name,
      customer_id: req.user.customer_id,
    };

    let response = await utill.helpers.validateTransaction(option);

    // if (status) {
    return res
      .status(200)
      .json(
        utill.helpers.sendSuccess(
          "Shipment booked successfully, the Dowkaa team would reach out to to soon."
        )
      );
  },

  updateProfile: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const itemSchema = utill.Joi.object()
      .keys({
        items: utill.Joi.array().required(),
        address: utill.Joi.string().required(),
        director: utill.Joi.string().required(),
      })
      .unknown();

    const validate1 = itemSchema.validate(req.body);

    if (validate1.error != null) {
      const errorMessage = validate1.error.details
        .map((i: any) => i.message)
        .join(".");
      return res.status(400).json(utill.helpers.sendError(errorMessage));
    }

    return res.status(200).json(utill.helpers.sendSuccess("Success!"));
  },
};