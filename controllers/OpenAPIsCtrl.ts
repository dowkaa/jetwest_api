export {};
import { NextFunction, Response } from "express";
const util = require("../utils/packages");
const { paginate } = require("paginate-info");
const { Op, QueryTypes } = require("sequelize");
const db = require("../database/mysql");

const getData = async () => {};
module.exports = {
  // shipper shipment booking API
  bookShipment: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const itemSchema = util.Joi.object()
      .keys({
        items: util.Joi.array().required(),
        pickup_location: util.Joi.string().required(),
        payment_ref: util.Joi.string().required(),
        destination: util.Joi.string().required(),
        total_weight: util.Joi.number().required(),
        stod: util.Joi.string().required(),
        total_amount: util.Joi.number().required(),
        agent_id: util.Joi.string().allow(""),
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
      total_amount,
      reciever_email,
      reciever_firstname,
      reciever_lastname,
      reciever_organisation,
      reciever_primaryMobile,
      reciever_secMobile,
    } = req.body;

    let userChecker = await db.dbs.Users.findOne({
      where: { uuid: req.user.uuid },
    });

    if (userChecker.type !== "Shipper") {
      return res
        .status(400)
        .json(
          util.helpers.sendError(
            "Only shippers are allowed for this API service"
          )
        );
    }

    let shipment_num = util.helpers.generateReftId(10);
    let scan_code = util.helpers.generateReftId(10);

    if (agent_id) {
      let checker = await db.dbs.Users.findOne({
        where: { uuid: agent_id },
      });

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

    if (v.available_capacity < parseInt(total_weight)) {
      return res
        .status(400)
        .json(
          util.helpers.sendError(
            "Flight not availbale to carry total weight, kindly book another flight or contact customer support"
          )
        );
    }

    if (Date.parse(stod) - new Date().getTime() <= 1079999) {
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
        return res.status(400).json(util.helpers.sendError("Route not found"));
      }

      let cargo = await db.dbs.Cargo.findOne({
        where: { flight_reg: v.flight_reg },
      });

      if (!cargo) {
        return res
          .status(400)
          .json(
            util.helpers.sendError(
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

      price = price * parseFloat(route.dailyExchangeRate);

      let checkBalance = await db.dbs.Wallets.findOne({
        where: { user_id: userChecker.id },
      });

      if (parseFloat(checkBalance?.amount) - price < 0) {
        let checkTransactionTotal = await db.dbs.Transactions.sum("amount", {
          where: { user_id: req.user.id },
        });

        if (checkTransactionTotal < 1000000) {
          let resp = await util.helpers.logPendingShipment(req, res, items);

          const option = {
            email: req.user.email,
            name: req.user.first_name + " " + req.user.last_name,
          };

          util.shipperAPI.sendMail(option);

          return res
            .status(resp.status)
            .json(
              resp.status === 4000
                ? util.helpers.sendError(resp.message)
                : util.helpers.sendSuccess(resp.message)
            );
        } else {
          let userWallet = await db.dbs.Wallets.findOne({
            where: { user_id: req.user.id },
          });

          if (parseFloat(userWallet.amount_owed) < 10) {
            let resp = await util.helpers.addShipmentAndCreditUser(
              req,
              res,
              req.user.id,
              items
            );

            const option = {
              email: req.user.email,
              name: req.user.first_name + " " + req.user.last_name,
            };

            util.SuperShipperAPIMail.sendMail(option);

            return res
              .status(resp.status)
              .json(
                resp.status === 4000
                  ? util.helpers.sendError(resp.message)
                  : util.helpers.sendSuccess(resp.message)
              );
          } else {
            let resp = await util.helpers.logPendingShipment(req, res, items);

            return res
              .status(resp.status)
              .json(
                resp.status === 4000
                  ? util.helpers.sendError(resp.message)
                  : util.helpers.sendSuccess(resp.message)
              );
          }
        }
      }

      if (agent_id) {
        let agent = await db.dbs.Users.findOne({
          where: { uuid: agent_id },
        });
        let status = await db.dbs.ShippingItems.create({
          uuid: util.uuid(),
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
          uuid: util.uuid(),
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
      email: req.user.email,
      id: req.user.id,
      customer_id: req.user.customer_id,
    };

    util.shipperAPI.sendMail(option);

    util.helpers.logApiTransaction(
      req.user.customer_id,
      total_amount,
      shipment_num,
      `Payment for shipment with no ${shipment_num}`
    );
    // if (status) {
    return res
      .status(200)
      .json(
        util.helpers.sendSuccess(
          "Shipment booked successfully, the Dowkaa team would reach out to to soon."
        )
      );
  },

  allShipments: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    let user = await db.dbs.Users.findOne({ where: { uuid: req.user.uuid } });

    if (user.type === "Shipper") {
      return res
        .status(400)
        .json(
          util.helpers.sendError(
            "Non Shippers are not allowed to access this API"
          )
        );
    }
    let allShipments = await db.dbs.ShippingItems.findAll({
      where: { user_id: req.user.id },
    });

    return res.status(200).json({ allShipments });
  },

  singleShpment: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    let user = await db.dbs.Users.findOne({ where: { uuid: req.user.uuid } });

    if (user.type === "Shipper") {
      return res
        .status(400)
        .json(
          util.helpers.sendError(
            "Non Shippers are not allowed to access this API"
          )
        );
    }
    let shipment_id = req.query.shipment_id;
    if (!shipment_id) {
      return res
        .status(400)
        .json(util.helpers.sendError("Kindly add a valid shipment id"));
    }

    let shipment = await db.dbs.ShippingItems.findOne({
      where: { uuid: shipment_id },
    });

    return res.status(200).json({ shipment });
  },

  trackShipments: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    let user = await db.dbs.Users.findOne({ where: { uuid: req.user.uuid } });

    let { booking_ref, pageNum } = req.query;

    if (!pageNum || isNaN(pageNum) || !booking_ref) {
      return res
        .status(400)
        .json(util.helpers.sendError("Kindly add a valid page number"));
    }

    var currentPage = parseInt(pageNum) ? parseInt(pageNum) : 1;

    var page = currentPage - 1;
    var pageSize = 25;
    const offset = page * pageSize;
    const limit = pageSize;

    var shipments = await db.dbs.ShippingItems.findAndCountAll({
      offset: offset,
      limit: limit,
      where: {
        [Op.or]: [
          { booking_reference: booking_ref },
          { shipment_num: booking_ref },
        ],
      },
      order: [["id", "DESC"]],
    });

    var next_page = currentPage + 1;
    var prev_page = currentPage - 1;
    var nextP =
      "/api/jetwest/customer-service/trackShipment?pageNum=" + next_page;
    var prevP =
      "/api/jetwest/customer-service/trackShipment?pageNum=" + prev_page;

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
      first_page_url: "/api/jetwest/customer-service/trackShipment?pageNum=1",
      last_page_url:
        "/api/jetwest/customer-service/trackShipment?pageNum=" + meta.pageCount, //transactions.count,
      next_page_url: nextP,
      prev_page_url: prevP,
      path: "/api/jetwest/customer-service/trackShipment",
      from: 1,
      to: meta.pageCount, //transactions.count,
    });
  },

  // Agents APIs

  getIncomingFlights: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const { pageNum, airport } = req.query;

    if (!pageNum || isNaN(pageNum)) {
      return res
        .status(400)
        .json(util.helpers.sendError("Kindly add a valid page number"));
    }

    if (!airport) {
      return res
        .status(400)
        .json(util.helpers.sendError("Kindly add your current airport"));
    }

    let user = await db.dbs.Users.findOne({ where: { uuid: req.user.uuid } });

    if (user.type === "Agent") {
      return res
        .status(400)
        .json(
          util.helpers.sendError(
            "Non Agents are not allowed to access this API"
          )
        );
    }

    var currentPage = parseInt(pageNum) ? parseInt(pageNum) : 1;

    var page = currentPage - 1;
    var pageSize = 25;
    const offset = page * pageSize;
    const limit = pageSize;

    let enrouteShipments = await db.dbs.ScheduleFlights.findAndCountAll({
      offset: offset,
      limit: limit,
      where: { status: "enroute", destination_airport: airport },
      order: [["id", "DESC"]],
      include: [
        {
          model: db.dbs.ShippingItems,
          as: "shipping_items",
          required: false,
          where: {
            [Op.or]: [{ agent_id: user.id }, { agent_id: user.uuid }],
          },
        },
      ],
    });

    var next_page = currentPage + 1;
    var prev_page = currentPage - 1;
    var nextP = `/api/jetwest/open-api/incoming-flights?pageNum=` + next_page;
    var prevP = `/api/jetwest/open-api/incoming-flights?pageNum=` + prev_page;

    const meta = paginate(
      currentPage,
      enrouteShipments.count,
      enrouteShipments.rows,
      pageSize
    );

    return res.status(200).json({
      status: "SUCCESS",
      data: enrouteShipments,
      per_page: pageSize,
      current_page: currentPage,
      last_page: meta.pageCount, //transactions.count,
      first_page_url: `/api/jetwest/open-api/incoming-flights?pageNum=1`,
      last_page_url:
        `/api/jetwest/open-api/incoming-flights?pageNum=` + meta.pageCount, //transactions.count,
      next_page_url: nextP,
      prev_page_url: prevP,
      path: `/api/jetwest/open-api/incoming-flights?pageNum=`,
      from: 1,
      to: meta.pageCount, //transactions.count,
    });
  },

  getOutgoingFlights: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const { pageNum, airport } = req.query;

    if (!pageNum || isNaN(pageNum)) {
      return res
        .status(400)
        .json(util.helpers.sendError("Kindly add a valid page number"));
    }

    if (!airport) {
      return res
        .status(400)
        .json(util.helpers.sendError("Kindly add your current airport"));
    }

    let user = await db.dbs.Users.findOne({ where: { uuid: req.user.uuid } });

    if (user.type === "Agent") {
      return res
        .status(400)
        .json(
          util.helpers.sendError(
            "Non Agents are not allowed to access this API"
          )
        );
    }

    var currentPage = parseInt(pageNum) ? parseInt(pageNum) : 1;

    var page = currentPage - 1;
    var pageSize = 25;
    const offset = page * pageSize;
    const limit = pageSize;

    let outgoingFlights = await db.dbs.ScheduleFlights.findAndCountAll({
      offset: offset,
      limit: limit,
      where: { status: "enroute", takeoff_airport: airport },
      order: [["id", "DESC"]],
      include: [
        {
          model: db.dbs.ShippingItems,
          as: "shipping_items",
          required: false,
          where: {
            [Op.or]: [{ agent_id: user.id }, { agent_id: user.uuid }],
          },
        },
      ],
    });

    var next_page = currentPage + 1;
    var prev_page = currentPage - 1;
    var nextP = `/api/jetwest/open-api/outgoing-flights?pageNum=` + next_page;
    var prevP = `/api/jetwest/open-api/outgoing-flights?pageNum=` + prev_page;

    const meta = paginate(
      currentPage,
      outgoingFlights.count,
      outgoingFlights.rows,
      pageSize
    );

    return res.status(200).json({
      status: "SUCCESS",
      data: outgoingFlights,
      per_page: pageSize,
      current_page: currentPage,
      last_page: meta.pageCount, //transactions.count,
      first_page_url: `/api/jetwest/open-api/outgoing-flights?pageNum=1`,
      last_page_url:
        `/api/jetwest/open-api/outgoing-flights?pageNum=` + meta.pageCount, //transactions.count,
      next_page_url: nextP,
      prev_page_url: prevP,
      path: `/api/jetwest/open-api/outgoing-flights?pageNum=`,
      from: 1,
      to: meta.pageCount, //transactions.count,
    });
  },

  // carriers API services
  getDashboard: async (req: any, res: Response, next: NextFunction) => {
    let checker = await db.dbs.Users.findOne({
      where: { uuid: req.user.uuid, type: "Carrier" },
    });

    if (!checker) {
      return res
        .status(400)
        .json(util.helpers.sendError("Non carriers are not allowed here"));
    }

    let cargo = await db.dbs.Cargo.findOne({
      where: { owner_id: req.user.uuid },
    });

    if (!cargo) {
      return res.status(200).json({
        totalCompletedShipments: 0,
        totalAmount: 0,
        totalCancelled: 0,
        totalkg: 0,
      });
    }

    var totalCompletedShipments = await db.dbs.ShippingItems.count({
      where: {
        [Op.or]: [{ cargo_id: cargo.id }, { cargo_id: cargo.uuid }],
        status: "completed",
      },
      order: [["id", "DESC"]],
    });

    var totalCancelled = await db.dbs.ShippingItems.count({
      where: {
        [Op.or]: [{ cargo_id: cargo.id }, { cargo_id: cargo.uuid }],
        status: "cancelled",
      },
      order: [["id", "DESC"]],
    });

    const totalSuccessfullTransactionsAmount = await db.dbs.Transactions.sum(
      "amount",
      {
        where: {
          [Op.or]: [{ cargo_id: cargo.id }, { cargo_id: cargo.uuid }],
          status: "success",
        },
      }
    );

    const totalkg = await db.dbs.ShippingItems.sum("chargeable_weight", {
      where: { cargo_id: cargo.uuid },
    });

    return res.status(200).json({
      totalCompletedShipments,
      totalSuccessfullTransactionsAmount,
      totalCancelled,
      totalkg,
    });
  },
  allFrieghts: async (req: any, res: Response, next: NextFunction) => {
    let checker = await db.dbs.Users.findOne({
      where: { uuid: req.user.uuid, type: "Carrier" },
    });

    if (!checker) {
      return res
        .status(400)
        .json(util.helpers.sendError("Non carriers are not allowed here"));
    }

    const { pageNum } = req.query;

    if (!pageNum || isNaN(pageNum)) {
      return res
        .status(400)
        .json(util.helpers.sendError("Kindly add a valid page number"));
    }

    var currentPage = parseInt(pageNum) ? parseInt(pageNum) : 1;

    var page = currentPage - 1;
    var pageSize = 25;
    const offset = page * pageSize;
    const limit = pageSize;

    var shipments = await db.dbs.ScheduleFlights.findAndCountAll({
      offset: offset,
      limit: limit,
      where: {
        [Op.or]: [
          { aircraft_owner: checker.id },
          { aircraft_owner: checker.uuid },
        ],
      },
      order: [["id", "DESC"]],
    });
    //1`;

    var next_page = currentPage + 1;
    var prev_page = currentPage - 1;
    var nextP = `/api/jetwest/carriers/all-frieghts?pageNum=` + next_page;
    var prevP = `/api/jetwest/carriers/all-frieghts?pageNum=` + prev_page;

    const meta = paginate(
      currentPage,
      shipments.count,
      shipments.rows,
      pageSize
    );

    res.status(200).json({
      status: "SUCCESS",
      data: shipments,
      per_page: pageSize,
      current_page: currentPage,
      last_page: meta.pageCount, //transactions.count,
      first_page_url: `/api/jetwest/carriers/all-frieghts?pageNum=`,
      last_page_url:
        `/api/jetwest/carriers/all-frieghts?pageNum=` + meta.pageCount, //transactions.count,
      next_page_url: nextP,
      prev_page_url: prevP,
      path: `/api/jetwest/carriers/all-frieghts`,
      from: 1,
      to: meta.pageCount, //transactions.count,
    });
  },

  completedFrieghts: async (req: any, res: Response, next: NextFunction) => {
    let checker = await db.dbs.Users.findOne({
      where: { uuid: req.user.uuid, type: "Carrier" },
    });
    if (!checker) {
      return res
        .status(400)
        .json(util.helpers.sendError("Non carriers are not allowed here"));
    }

    const { pageNum } = req.query;

    if (!pageNum || isNaN(pageNum)) {
      return res
        .status(400)
        .json(util.helpers.sendError("Kindly add a valid page number"));
    }

    // /api/jetwest/carriers/completed-frieghts?page=

    var currentPage = parseInt(pageNum) ? parseInt(pageNum) : 1;

    var page = currentPage - 1;
    var pageSize = 25;
    const offset = page * pageSize;
    const limit = pageSize;

    var shipments = await db.dbs.ScheduleFlights.findAndCountAll({
      offset: offset,
      limit: limit,
      where: {
        [Op.or]: [
          { aircraft_owner: checker.id },
          { aircraft_owner: checker.uuid },
        ],
        status: "completed",
      },
      order: [["id", "DESC"]],
    });

    var next_page = currentPage + 1;
    var prev_page = currentPage - 1;
    var nextP = `/api/jetwest/carriers/completed-frieghts?pageNum=` + next_page;
    var prevP = `/api/jetwest/carriers/completed-frieghts?pageNum=` + prev_page;

    const meta = paginate(
      currentPage,
      shipments.count,
      shipments.rows,
      pageSize
    );

    res.status(200).json({
      status: "SUCCESS",
      data: shipments,
      per_page: pageSize,
      current_page: currentPage,
      last_page: meta.pageCount, //transactions.count,
      first_page_url: `/api/jetwest/carriers/completed-frieghts?pageNum=1`,
      last_page_url:
        `/api/jetwest/carriers/completed-frieghts?pageNum=` + meta.pageCount, //transactions.count,
      next_page_url: nextP,
      prev_page_url: prevP,
      path: `/api/jetwest/carriers/completed-frieghts`,
      from: 1,
      to: meta.pageCount, //transactions.count,
    });
  },

  FrieghtsEnroute: async (req: any, res: Response, next: NextFunction) => {
    let checker = await db.dbs.Users.findOne({
      where: { uuid: req.user.uuid, type: "Carrier" },
    });

    if (!checker) {
      return res
        .status(400)
        .json(util.helpers.sendError("Non carriers are not allowed here"));
    }

    const { pageNum } = req.query;

    if (!pageNum || isNaN(pageNum)) {
      return res
        .status(400)
        .json(util.helpers.sendError("Kindly add a valid page number"));
    }

    var currentPage = parseInt(pageNum) ? parseInt(pageNum) : 1;

    var page = currentPage - 1;
    var pageSize = 25;
    const offset = page * pageSize;
    const limit = pageSize;

    var shipments = await db.dbs.ScheduleFlights.findAndCountAll({
      offset: offset,
      limit: limit,
      where: {
        [Op.or]: [
          { aircraft_owner: checker.id },
          { aircraft_owner: checker.uuid },
        ],
        status: "enroute",
      },
      order: [["id", "DESC"]],
    });

    var next_page = currentPage + 1;
    var prev_page = currentPage - 1;
    var nextP =
      `/api/jetwest/carriers/frieghts-in-progress?pageNum=` + next_page;
    var prevP =
      `/api/jetwest/carriers/frieghts-in-progress?pageNum=` + prev_page;

    const meta = paginate(
      currentPage,
      shipments.count,
      shipments.rows,
      pageSize
    );

    res.status(200).json({
      status: "SUCCESS",
      data: shipments,
      per_page: pageSize,
      current_page: currentPage,
      last_page: meta.pageCount, // transactions.count,
      first_page_url: `/api/jetwest/carriers/frieghts-in-progress?pageNum=1`,
      last_page_url:
        `/api/jetwest/carriers/frieghts-in-progress?pageNum=` + meta.pageCount, //transactions.count,
      next_page_url: nextP,
      prev_page_url: prevP,
      path: `/api/jetwest/carriers/frieghts-in-progress`,
      from: 1,
      to: meta.pageCount, //transactions.count,
    });
  },

  getShipmentsInflight: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    let id = req.query.flight_id;

    if (!id) {
      return res
        .status(400)
        .json(util.helpers.sendError("Kindly add a valid scheduled flight id"));
    }

    let shippingItems = await db.dbs.ShippingItems.findAll({
      where: { flight_id: id },
    });

    return res.status(200).json({ shippingItems });
  },

  getData: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    let allLogistics: any = [];
    var completed = await db.dbs.sequelize
      .query(
        "SELECT * from schedule_flights, shipping_items where aircraft_owner=:owner AND shipping_items.flight_id=schedule_flights.uuid;",
        {
          replacements: { owner: req.user.uuid }, // schedule_flights.takeoff_airport=:airport
          type: QueryTypes.SELECT,
        }
      )
      .then((objs: any) => {
        objs.forEach((obj: any) => {
          // var id = obj.id;
          // var flight_reg = obj.flight_reg;
          // var destination_airport = obj.destination_airport;
          // var takeoff_airport = obj.takeoff_airport;
          // var schedule_flights_uuid = obj.schedule_flights_uuid;
          // var departure_date = obj.departure_date;
          // var departure_station = obj.departure_station;
          // var destination_station = obj.destination_station;
          // var stoa = obj.stoa;
          // var load_count = obj.load_count;
          // var offload_count = obj.offload_count;
          // var stod = obj.stod;
          // var taw = obj.taw;
          // var no_of_bags = obj.no_of_bags;
          // var status = obj.status;
          // var schedule_flights_createdAt = obj.schedule_flights_createdAt;

          allLogistics.push(obj);
        });
      });

    return res.status(200).json({ allLogistics });
  },
};
