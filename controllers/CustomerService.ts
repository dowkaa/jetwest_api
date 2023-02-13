export {};
import { NextFunction, response, Response } from "express";
const util = require("../utils/packages");
const { paginate } = require("paginate-info");
const { Op, QueryTypes } = require("sequelize");
const db = require("../database/mysql");
module.exports = {
  getAllUsers: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    let { type, pageNum } = req.query;

    if (!pageNum || isNaN(pageNum || !type)) {
      return res
        .status(400)
        .json(util.helpers.sendError("Kindly add a valid page number"));
    }

    var currentPage = parseInt(pageNum) ? parseInt(pageNum) : 1;

    var page = currentPage - 1;
    var pageSize = 25;
    const offset = page * pageSize;
    const limit = pageSize;

    var users = await db.dbs.Users.findAndCountAll({
      offset: offset,
      limit: limit,
      where: { type: type },
      order: [["id", "DESC"]],
    });

    var next_page = currentPage + 1;
    var prev_page = currentPage - 1;
    var nextP =
      "/api/jetwest/customer-service/all-user-by-type?pageNum=" + next_page;
    var prevP =
      "/api/jetwest/customer-service/all-user-by-type?pageNum=" + prev_page;

    const meta = paginate(currentPage, users.count, users.rows, pageSize);

    return res.status(200).json({
      status: "SUCCESS",
      data: users,
      per_page: pageSize,
      current_page: currentPage,
      last_page: meta.pageCount, //transactions.count,
      first_page_url:
        "/api/jetwest/customer-service/all-user-by-type?pageNum=1",
      last_page_url:
        "/api/jetwest/customer-service/all-user-by-type?pageNum=" +
        meta.pageCount, //transactions.count,
      next_page_url: nextP,
      prev_page_url: prevP,
      path: "/api/jetwest/customer-service/all-user-by-type",
      from: 1,
      to: meta.pageCount, //transactions.count,
    });
  },

  getUserUpcomingShipments: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const { pageNum, user_id } = req.query;

    if (isNaN(pageNum)) {
      return res
        .status(400)
        .json(util.helpers.sendError("page number must be a number"));
    }

    if (!pageNum || !user_id) {
      return res
        .status(400)
        .json(
          util.helpers.sendError(
            `${
              !pageNum
                ? "Kindly add a valid page number"
                : "Kindly add a valid user id"
            }`
          )
        );
    }

    var currentPage = parseInt(pageNum) ? parseInt(pageNum) : 1;

    var page = currentPage - 1;
    var pageSize = 25;
    const offset = page * pageSize;
    const limit = pageSize;

    let user = await db.dbs.Users.findOne({ where: { uuid: user_id } });

    if (!user) {
      return res.status(400).json(util.helpers.sendError("User not found"));
    }

    var shipments = await db.dbs.ShippingItems.findAndCountAll({
      offset: offset,
      limit: limit,
      where: { user_id: user.uuid, status: "pending" },
      order: [["id", "DESC"]],
    });

    var next_page = currentPage + 1;
    var prev_page = currentPage - 1;
    var nextP =
      "/api/jetwest/customer-service/upcoming-shipments?pageNum=" + next_page;
    var prevP =
      "/api/jetwest/customer-service/upcoming-shipments?pageNum=" + prev_page;

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
      first_page_url:
        "/api/jetwest/customer-service/upcoming-shipments?pageNum=1",
      last_page_url:
        "/api/jetwest/customer-service/upcoming-shipments?pageNum=" +
        meta.pageCount, //transactions.count,
      next_page_url: nextP,
      prev_page_url: prevP,
      path: "/api/jetwest/customer-service/upcoming-shipments",
      from: 1,
      to: meta.pageCount, //transactions.count,
    });
  },

  getUserShipmentsEnroute: async (
    req: any,
    res: Response
  ): Promise<Response> => {
    let { pageNum, user_id } = req.query;

    let user = await db.dbs.Users.findOne({
      where: { uuid: user_id },
    });

    if (!user) {
      return res.status(400).json(util.helpers.sendError("User not found"));
    }

    if (!pageNum || isNaN(pageNum || !user_id)) {
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
      where: { user_id: user.uuid, status: "enroute" },
      order: [["id", "DESC"]],
    });

    var next_page = currentPage + 1;
    var prev_page = currentPage - 1;
    var nextP =
      "/api/jetwest/customer-service/user-shipments-enroute?pageNum=" +
      next_page;
    var prevP =
      "/api/jetwest/customer-service/user-shipments-enroute?pageNum=" +
      prev_page;

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
      first_page_url:
        "/api/jetwest/customer-service/user-shipments-enroute?pageNum=1",
      last_page_url:
        "/api/jetwest/customer-service/user-shipments-enroute?pageNum=" +
        meta.pageCount, //transactions.count,
      next_page_url: nextP,
      prev_page_url: prevP,
      path: "/api/jetwest/customer-service/user-shipments-enroute",
      from: 1,
      to: meta.pageCount, //transactions.count,
    });
  },

  getUserCompletedShipments: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    let { pageNum, user_id } = req.query;

    if (!pageNum || isNaN(pageNum) || !user_id) {
      return res
        .status(400)
        .json(util.helpers.sendError("Kindly add a valid page number"));
    }

    let user = await db.dbs.Users.findOne({ where: { uuid: user_id } });

    if (!user) {
      return res.status(400).json(util.helpers.sendError("User not found"));
    }

    var currentPage = parseInt(pageNum) ? parseInt(pageNum) : 1;

    var page = currentPage - 1;
    var pageSize = 25;
    const offset = page * pageSize;
    const limit = pageSize;

    var shipments = await db.dbs.ShippingItems.findAndCountAll({
      offset: offset,
      limit: limit,
      where: { user_id: user.uuid, status: "completed" },
      order: [["id", "DESC"]],
    });

    var next_page = currentPage + 1;
    var prev_page = currentPage - 1;
    var nextP =
      "/api/jetwest/customer-service/completed-shipmemts?pageNum=" + next_page;
    var prevP =
      "/api/jetwest/customer-service/completed-shipmemts?pageNum=" + prev_page;

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
      first_page_url:
        "/api/jetwest/customer-service/completed-shipmemts?pageNum=1",
      last_page_url:
        "/api/jetwest/customer-service/completed-shipmemts?pageNum=" +
        meta.pageCount, //transactions.count,
      next_page_url: nextP,
      prev_page_url: prevP,
      path: "/api/jetwest/customer-service/completed-shipmemts",
      from: 1,
      to: meta.pageCount, //transactions.count,
    });
  },

  getAllShipmentsByNum: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    let { ref, pageNum } = req.query;

    if (!pageNum || isNaN(pageNum) || !ref) {
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
        booking_reference: ref,
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

  singleShipment: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    let shipment_id = req.query.shipment_id;

    if (!shipment_id) {
      return res
        .status(400)
        .json(util.helpers.sendError("Kindly add a valid shipment ids"));
    }

    let shipmemt = await db.dbs.ShippingItems.findOne({
      where: { uuid: shipment_id },
    });

    return res.status(200).json({ shipmemt });
  },

  bookCustomerShipment: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const itemSchema = util.Joi.object()
      .keys({
        items: util.Joi.array().required(),
        user_id: util.Joi.string().required(),
        pickup_location: util.Joi.string().required(),
        destination: util.Joi.string().required(),
        total_weight: util.Joi.number().required(),
        stod: util.Joi.string().required(),
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
      user_id,
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

    let user = await db.dbs.Users.findOne({ where: { uuid: user_id } });

    if (!user) {
      return res.status(400).json(util.helpers.sendError("User not found"));
    }

    if (agent_id) {
      let checker = await db.dbs.Users.findOne({ where: { uuid: agent_id } });

      if (!checker) {
        return res.status(400).json(util.helpers.sendError("Agent not found"));
      }
    }
    let shipment_num = util.helpers.generateReftId(10);
    let scan_code = util.helpers.generateReftId(10);

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

      let status = await db.dbs.ShippingItems.create({
        uuid: util.uuid(),
        flight_id: v.uuid,
        type,
        user_id: user.uuid,
        agent_id: agent_id,
        shipment_num,
        reference: payment_ref,
        value,
        pickup_location,
        chargeable_weight,
        cargo_id: cargo.uuid,
        destination,
        depature_date: depature_date.split("/").reverse().join("-"),
        width,
        length: length,
        height,
        sur_charge: route.sur_charge,
        taxes: route.tax,
        status: "pending",
        shipment_routeId: route.uuid,
        scan_code,
        book_type: "Admin",
        weight,
        ratePerKg: route.ratePerKg,
        logo_url: v.logo_url,
        arrival_date: v.arrival_date,
        booking_reference: shipment_ref,
        volumetric_weight,
        payment_status: "pending",
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
        reciever_organisation,
        reciever_primaryMobile,
        reciever_secMobile,
      });
    }
    v.no_of_bags = parseInt(v.no_of_bags) + items.length;
    await v.save();

    await db.dbs.AuditLogs.create({
      uuid: util.uuid(),
      user_id: req.user.uuid,
      description: `Admin ${req.user.first_name} ${req.user.last_name} booked ${items.length} shipments for user with id ${user.customer_id}`,
      data: JSON.stringify(req.body),
    });

    const option = {
      email: user.email,
      name: user.first_name + " " + user.last_name,
    };

    util.adminBook.sendMail(option);

    // if (status) {
    return res
      .status(200)
      .json(
        util.helpers.sendSuccess(
          "Shipment booked successfully, a notification email would be sent the shipper with details of the shipment. Thanks"
        )
      );
    // }
  },
};
