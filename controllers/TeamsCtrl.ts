export {};
import { NextFunction, response, Response } from "express";
const db = require("../database/mysql");
const utill = require("../utils/packages");
const { Op, QueryTypes } = require("sequelize");
const { paginate } = require("paginate-info");

module.exports = {
  // company admin creates users theme
  createTeam: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const schema = utill.Joi.object()
      .keys({
        team_type: utill.Joi.string().required(),
        first_name: utill.Joi.string().required(),
        last_name: utill.Joi.string().required(),
        country: utill.Joi.string().required(),
        email: utill.Joi.string().required(),
        mobile: utill.Joi.string().required(),
      })
      .unknown();
    const validate = schema.validate(req.body);
    let admin = await db.dbs.Users.findOne({ where: { uuid: req.user.uuid } });

    if (admin.team_id !== "Admin") {
      return res
        .status(400)
        .json(
          utill.helpers.sendError(
            "Only company system admins can resend onboarding emails to team members"
          )
        );
    }

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

    const { first_name, last_name, country, email, mobile, team_type } =
      req.body;

    let user = await db.dbs.Users.findOne({ where: { uuid: req.user.uuid } });

    if (!user) {
      return res.status(400).json(utill.helpers.sendError("User not found"));
    }

    if (user.verification_status != "completed") {
      return res
        .status(400)
        .json(
          utill.helpers.sendError("Unverified users cannot add team members")
        );
    }

    var customer_id = utill.helpers.generateClientId(10);
    var password = utill.helpers.generateReftId(6);

    await db.dbs.Users.create({
      team_id: team_type,
      type: user.type,
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
      invite_status: 0,
      companyFounded: user.companyFounded,
    });

    const option = {
      name: first_name + " " + last_name,
      email: email,
      message: `You have been added to your ${user.company_name} company's dowkaa account as a ${team_type} personnel. Kindly use the password below to login and access your company dashboard. Thanks`,
      password,
    };

    try {
      utill.teamWelcome.sendMail(option);
    } catch (e: any) {
      console.log({ e });
    }

    utill.helpers.updateInvite(email);

    return res
      .status(200)
      .json(utill.helpers.sendSuccess("User created successfully"));
  },

  resendOnboardingEmail: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    let admin = await db.dbs.Users.findOne({ where: { uuid: req.user.uuid } });

    if (admin.team_id !== "Admin") {
      return res
        .status(400)
        .json(
          utill.helpers.sendError(
            "Only company system admins can resend onboarding emails to team members"
          )
        );
    }
    let uuid = req.query.uuid;

    if (!uuid) {
      return res
        .status(400)
        .json(utill.helpers.sendError("Kindly add a valid admin id"));
    }

    let user = await db.dbs.Users.findOne({ where: { uuid: uuid } });

    if (!user) {
      return res.status(400).json(utill.helpers.sendError("User not found"));
    }

    if (user.login_count > 0) {
      return res
        .status(400)
        .json(
          utill.helpers.sendError(
            "User user already logged in to account, kindly ask user to reset their password or updte it. Thanks!"
          )
        );
    }

    if (user.invite_status === 0) {
      return res
        .status(400)
        .json(
          utill.helpers.sendError(
            "Email already resent to team member, kindly wait for 30 minutes before sending another email"
          )
        );
    }
    var password = utill.helpers.generateReftId(6);

    const option = {
      name: user.first_name + " " + user.last_name,
      email: user.email,
      message: `You have been added to your ${user.company_name} company's dowkaa account as a ${user.team_id} personnel. Kindly use the password below to login and access your company dashboard. Thanks`,
      password,
    };

    user.invite_status = 0;
    user.password = utill.bcrypt.hashSync(password);
    await user.save();

    try {
      utill.teamWelcome.sendMail(option);
    } catch (e: any) {
      console.log({ e });
    }
    utill.helpers.updateInvite(user.email);

    return res
      .status(200)
      .json(utill.helpers.sendSuccess("Login email resent successfully"));
  },

  allTeamMembers: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    let loggedInUsers = await db.dbs.Users.findAndCountAll({
      attributes: { exclude: ["id", "password", "otp", "locked", "activated"] },
      where: {
        company_name: req.user.company_name,
        login_count: { [Op.gt]: 0 },
      },
    });

    let notLoggedInUsers = await db.dbs.Users.findAndCountAll({
      attributes: { exclude: ["id", "password", "otp", "locked", "activated"] },
      where: { company_name: req.user.company_name, login_count: 0 },
    });

    return res.status(200).json({ loggedInUsers, notLoggedInUsers });
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

  updateUserRole: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    let { type, uuid } = req.query;

    if (!uuid) {
      return res
        .status(400)
        .json(utill.helpers.sendError("Kindly add a valid admin id"));
    }

    let admin = await db.dbs.Users.findOne({ where: { uuid: req.user.uuid } });

    if (admin.team_id !== "Admin") {
      return res
        .status(400)
        .json(
          utill.helpers.sendError(
            "Only company system admins can update user privilege"
          )
        );
    }

    let user = await db.dbs.Users.findOne({ where: { uuid: uuid } });

    if (!user) {
      return res.status(400).json(utill.helpers.sendError("User not found"));
    }

    user.team_id = type;
    await user.save();

    return res
      .status(200)
      .json(utill.helpers.sendSuccess("User privilege updated successfully"));
  },

  deleteAdmin: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    let admin = await db.dbs.Users.findOne({ where: { uuid: req.user.uuid } });

    if (admin.team_id !== "Admin") {
      return res
        .status(400)
        .json(
          utill.helpers.sendError("Only company system admins can delete admin")
        );
    }
    let uuid = req.query.uuid;

    if (!uuid) {
      return res
        .status(400)
        .json(utill.helpers.sendError("Kindly add a valid admin id"));
    }

    let user = await db.dbs.Users.findOne({ where: { uuid: uuid } });

    if (!user) {
      return res
        .status(400)
        .json(utill.helpers.sendError("Team member not found"));
    }

    const option = {
      name: user.first_name + " " + user.last_name,
      email: user.email,
      message: `You have been removed from to your ${user.company_name} company's dowkaa account as a team member. Kindly reach out to your company system admin for further clerifications. Thanks`,
    };

    try {
      utill.teamDelete.sendMail(option);
    } catch (e: any) {
      console.log({ e });
    }

    await user.destroy();

    return res
      .status(200)
      .json(utill.helpers.sendSuccess("Admin User deleted successfully"));
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

    if (user.team_id === "Logistics") {
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

    if (user.team_id === "Logistics") {
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

    const { pageNum } = req.query;

    if (!pageNum || isNaN(pageNum)) {
      return res
        .status(400)
        .json(utill.helpers.sendError("Kindly add a valid page number"));
    }

    var currentPage = parseInt(pageNum) ? parseInt(pageNum) : 1;

    var page = currentPage - 1;
    var pageSize = 25;
    const offset = page * pageSize;
    const limit = pageSize;

    let shipments = await db.dbs.ShippingItems.findAndCountAll({
      offset: offset,
      limit: limit,
      where: { company_name: user.company_name },
      order: [["id", "DESC"]],
    });

    var next_page = currentPage + 1;
    var prev_page = currentPage - 1;
    var nextP = `/api/dowkaa/team/all-company-shipments?pageNum=` + next_page;
    var prevP = `/api/dowkaa/team/all-company-shipments?pageNum=` + prev_page;

    const meta = paginate(
      currentPage,
      shipments.count,
      shipments.rows,
      pageSize
    );

    return res.status(200).json({
      status: "SUCCESS",
      data: shipments,
      per_page: pageSize,
      current_page: currentPage,
      last_page: meta.pageCount, //transactions.count,
      first_page_url: `/api/dowkaa/team/all-company-shipments?pageNum=1`,
      last_page_url:
        `/api/dowkaa/team/all-company-shipments?pageNum=` + meta.pageCount, //transactions.count,
      next_page_url: nextP,
      prev_page_url: prevP,
      path: `/api/dowkaa/team/all-company-shipments?pageNum=`,
      from: 1,
      to: meta.pageCount, //transactions.count,
    });
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
        cargo_type: utill.Joi.string().required(),
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
      cargo_type,
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

    let arr = JSON.parse(v.departure_date);

    if (!arr.includes(items[0].depature_date)) {
      return res
        .status(400)
        .json(
          utill.helpers.sendError(
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
          utill.helpers.sendError(
            "Flight not available for booking, already in transit"
          )
        );
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

    if (
      Date.parse(items[0].depature_date + " " + stod) - new Date().getTime() <=
      1079999
    ) {
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

    let cargo = await db.dbs.Cargo.findOne({
      where: { flight_reg: v.flight_reg },
    });

    if (!cargo) {
      return res
        .status(400)
        .json(
          utill.helpers.sendError(
            `Aircraft with flight registration number ${v.flight_reg} not found.`
          )
        );
    }

    for (const item of cargo_type) {
      if (cargo.cargo_types) {
        if (!JSON.parse(cargo.cargo_types).includes(item)) {
          return res
            .status(400)
            .json(
              utill.helpers.sendError(
                `Aircraft not allowed to carry ${item}, kindly use select or contact support.`
              )
            );
        }
      } else {
        return res
          .status(400)
          .json(utill.helpers.sendError(`Aircraft does not have cargo types.`));
      }
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
        insurance = price3;
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
              utill.helpers.sendError(
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
          insurance,
          sur_charge: price * (parseFloat(route.sur_charge) / 100),
          taxes: price * (parseFloat(route.tax) / 100),
          booking_type: "Team",
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
          stod: items[0].depature_date + " " + stod,
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
          insurance,
          sur_charge: price * (parseFloat(route.sur_charge) / 100),
          taxes: price * (parseFloat(route.tax) / 100),
          booking_type: "Team",
          status: "pending",
          shipment_routeId: route.id,
          scan_code,
          stod: items[0].depature_date + " " + stod,
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
};
