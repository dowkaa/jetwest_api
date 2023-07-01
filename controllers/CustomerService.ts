export {};
import { NextFunction, response, Response } from "express";
const util = require("../utils/packages");
const { paginate } = require("paginate-info");
const { Op, QueryTypes } = require("sequelize");
const db = require("../database/mysql");

const updateShipmentStatus = async (items: any) => {
  setTimeout(async () => {
    for (const item of items) {
      let checker = await db.dbs.ShippingItems.findOne({
        where: { booking_reference: item.shipment_ref },
      });
      let v = await db.dbs.ScheduleFlights.findOne({
        where: {
          id: checker.flight_id,
        },
      });

      if (checker.payment_status === "pending") {
        checker.payment_status = "failed";
        await checker.save();

        v.available_capacity =
          parseFloat(v.available_capacity) + parseFloat(checker.weight);
        v.totalAmount = parseFloat(v.totalAmount) - parseFloat(checker.price);
        v.taw = parseFloat(v.taw) - parseFloat(checker.weight);
        await v.save();
      }
    }
    // }, 10000);
  }, 3600000);
};

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
      where: { type: type, team_id: "Admin" },
      order: [["id", "DESC"]],
    });

    let arr = [];

    for (const item of users.rows) {
      let totalShipments = await db.dbs.ShippingItems.count({
        where: {
          [Op.or]: [
            { user_id: { [Op.or]: [item.uuid, item.id] } },
            { company_name: item.company_name },
          ],
        },
      });

      let totalKg = await db.dbs.ShippingItems.sum("chargeable_weight", {
        where: {
          [Op.or]: [
            { user_id: { [Op.or]: [item.uuid, item.id] } },
            { company_name: item.company_name },
          ],
        },
      });

      let totalAmount = await db.dbs.Transactions.sum("amount_in_dollars", {
        where: { user_id: item.customer_id, status: "success" },
      });

      arr.push({
        uuid: item.uuid,
        first_name: item.first_name,
        last_name: item.last_name,
        customer_id: item.customer_id,
        organisation: item.organisation,
        username: item.username,
        email: item.email,
        country: item.country,
        mobile_number: item.mobile_number,
        reg_mail_status: item.reg_mail_status,
        is_Admin: item.is_admin,
        admin_type: item.admin_type,
        roles: item.roles,
        status: item.status,
        company_name: item.company_name,
        login_count: item.login_count,
        notes: item.notes,
        airport: item.airport,
        company_address: item.company_address,
        reg_status: item.reg_status,
        role_id: item.role_id,
        companyFounded: item.companyFounded,
        verification_status: item.verification_status,
        profileDoc: item.profileDoc,
        type: item.type,
        ratePerKg: item.ratePerKg,
        createdAt: item.createdAt,
        totalKg,
        totalAmount,
        totalShipments,
      });
    }

    let data = {
      count: users.count,
      rows: arr,
    };

    var next_page = currentPage + 1;
    var prev_page = currentPage - 1;
    var nextP =
      "/api/jetwest/customer-service/all-user-by-type?pageNum=" + next_page;
    var prevP =
      "/api/jetwest/customer-service/all-user-by-type?pageNum=" + prev_page;

    const meta = paginate(currentPage, users.count, users.rows, pageSize);

    return res.status(200).json({
      status: "SUCCESS",
      data: data,
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

  getUserUpdate: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    let user_id = req.query.user_id;

    if (!user_id) {
      return res
        .status(400)
        .json(util.helpers.sendError("Kindly add a user id"));
    }

    let user = await db.dbs.Users.findOne({ where: { uuid: user_id } });

    if (!user) {
      return res.status(400).json(util.helpers.sendError("User not found"));
    }

    let totalAmount = await db.dbs.Transactions.sum("amount", {
      where: { user_id: user.customer_id, status: "success" },
    });

    let totalShipments = await db.dbs.ShippingItems.count({
      where: { user_id: { [Op.or]: [user.uuid, user.id] } },
    });

    let totalKg = await db.dbs.ShippingItems.sum("chargeable_weight", {
      where: { user_id: { [Op.or]: [user.uuid, user.id] } },
    });

    return res.status(200).json({ totalAmount, totalKg, totalShipments });
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
      where: {
        [Op.or]: [
          { user_id: { [Op.or]: [user.uuid, user.id] } },
          { company_name: user.company_name },
        ],
        status: "pending",
      },

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
      where: {
        [Op.or]: [
          { user_id: { [Op.or]: [user.uuid, user.id] } },
          { company_name: user.company_name },
        ],
        status: "enroute",
      },
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
      where: {
        [Op.or]: [
          { user_id: { [Op.or]: [user.uuid, user.id] } },
          { company_name: user.company_name },
        ],
        status: "completed",
      },
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
        [Op.or]: [{ booking_reference: ref }, { shipment_num: ref }],
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

  // this should be held for 30 minutes after which the payment_status is updated to failed
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
        cargo_type: util.Joi.array().required(),
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
        cargo_type: util.Joi.string().required(),
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
      cargo_type,
      reciever_firstname,
      reciever_lastname,
      reciever_organisation,
      reciever_primaryMobile,
      reciever_secMobile,
    } = req.body;

    // if (req.user.admin_type !== ("Customer Service" || "Super Admin")) {
    //   return res
    //     .status(400)
    //     .json(
    //       util.helpers.sendError(
    //         "Only Super Admin or Customer Services are allowed"
    //       )
    //     );
    // }

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

    for (const item of cargo_type) {
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
      where: { destination_name: destination },
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
        category,
        ba_code_url,
        cargo_type,
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
        let totalPrice = price + price1 + price2 + price3;
        insurance = price3;
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

      let shipment_model = "assisted booking";

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
        shipment_model
      );

      // let status = await db.dbs.ShippingItems.create({
      //   uuid: util.uuid(),
      //   flight_id: v.id,
      //   type,
      //   user_id: user.id,
      //   agent_id: agent_id,
      //   route_id: route.id,
      //   shipment_num,
      //   reference: payment_ref,
      //   value,
      //   pickup_location,
      //   chargeable_weight,
      //   cargo_index: cargo_type,
      //   cargo_id: cargo.id,
      //   destination,
      //   depature_date: depature_date.split("/").reverse().join("-"),
      //   width,
      //   length: length,
      //   height,
      //   insurance,
      //   sur_charge: price * (parseFloat(route.sur_charge) / 100),
      //   taxes: price * (parseFloat(route.tax) / 100),
      //   status: "pending",
      //   shipment_routeId: route.id,
      //   scan_code,
      //   book_type: "Admin",
      //   weight,
      //   ratePerKg: route.ratePerKg,
      //   logo_url: v.logo_url,
      //   arrival_date: v.arrival_date,
      //   booking_reference: shipment_ref,
      //   volumetric_weight,
      //   payment_status: "pending",
      //   price: price,
      //   stod: items[0].depature_date + " " + stod,
      //   category,
      //   company_name: user.company_name,
      //   ba_code_url,
      //   promo_code: promo_code ? promo_code : null,
      //   shipperName: user.first_name + " " + user.last_name,
      //   organisation: user.organisation,
      //   address: user?.company_address,
      //   country: user?.country,
      //   shipperNum: user.customer_id,
      //   no_of_bags: items.length,
      //   content,
      //   reciever_firstname,
      //   reciever_lastname,
      //   reciever_email,
      //   reciever_organisation,
      //   reciever_primaryMobile,
      //   reciever_secMobile,
      // });
    }
    util.helpers.updateScheduleTotal(v.uuid, route.uuid, shipment_num);
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

    let amount = await db.dbs.ShippingItems.sum("price", {
      where: { shipment_num: shipment_num },
    });

    // checkBalance.amount = parseFloat(checkBalance.amount) - amount;
    // checkBalance.amount_deducted = amount;
    // await checkBalance.save();

    let item = await db.dbs.ShippingItems.findOne({
      where: { shipment_num: shipment_num },
    });

    await db.dbs.Transactions.create({
      uuid: util.uuid(),
      user_id: user.id,
      reference: "nil",
      rate: parseFloat(route.dailyExchangeRate),
      amount_in_dollars: amount,
      amount_in_local_currency: amount * parseFloat(route.dailyExchangeRate),
      amount_deducted: amount,
      departure: item.pickup_location,
      arrival: item.destination,
      cargo_id: item.cargo_id,
      departure_date: item.depature_date.split("/").reverse().join("-"),
      arrival_date: item.arrival_date,
      shipment_no: shipment_num,
      company_name: user.company_name,
      booked_by: req.user.first_name + " " + req.user.last_name,
      weight: item.weight,
      reciever_organisation: item.reciever_organisation,
      pricePerkeg: item.pricePerKg,
      no_of_bags: items.length,
      type: "credit",
      method: "wallet",
      description:
        "Payment for shipment booked on your behalf by the dowkaa system support.",
      status: "pending",
      airwaybill_cost: parseFloat(route.air_wayBill_rate),
      total_cost: amount,
    });

    updateShipmentStatus(items);

    await db.dbs.AuditLogs.create({
      uuid: util.uuid(),
      user_id: req.user.id,
      description: `Admin ${req.user.first_name} ${req.user.last_name} booked a shipment for a customer with customer id ${user.customer_id}`,
      data: JSON.stringify(req.body),
    });
    // if (status) {
    return res
      .status(200)
      .json(
        util.helpers.sendSuccess(
          "Shipment booked successfully, a notification email would be sent to the shipper with details of the shipment. Thanks"
        )
      );
    // }
  },

  viewPaymentDocs: async (req: any, res: Response): Promise<Response> => {
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

    let paymentProof = await db.dbs.Transactions.findAndCountAll({
      offset: offset,
      limit: limit,
      where: { status: "pending_verification" },
      include: [{ model: db.dbs.PaymentProofs, as: "payment_proof" }],
      order: [["id", "DESC"]],
    });

    var next_page = currentPage + 1;
    var prev_page = currentPage - 1;
    var nextP =
      `/api/jetwest/auth/pending-payment-proof-docs?pageNum=` + next_page;
    var prevP =
      `/api/jetwest/auth/pending-payment-proof-docs?pageNum=` + prev_page;

    const meta = paginate(
      currentPage,
      paymentProof.count,
      paymentProof.rows,
      pageSize
    );

    return res.status(200).json({
      status: "SUCCESS",
      data: paymentProof,
      per_page: pageSize,
      current_page: currentPage,
      last_page: meta.pageCount, //transactions.count,
      first_page_url: `/api/jetwest/auth/pending-payment-proof-docs?pageNum=1`,
      last_page_url:
        `/api/jetwest/auth/pending-payment-proof-docs?pageNum=` +
        meta.pageCount, //transactions.count,
      next_page_url: nextP,
      prev_page_url: prevP,
      path: `/api/jetwest/auth/pending-payment-proof-docs?pageNum=`,
      from: 1,
      to: meta.pageCount, //transactions.count,
    });
  },

  // update bank transfers
  confirmPayment: async (req: any, res: Response): Promise<Response> => {
    const itemSchema = util.Joi.object()
      .keys({
        user_id: util.Joi.string().required(),
        shipment_num: util.Joi.string().required(),
        status: util.Joi.string().required(),
        message: util.Joi.string().allow(""),
      })
      .unknown();

    const validate1 = itemSchema.validate(req.body);

    if (validate1.error != null) {
      const errorMessage = validate1.error.details
        .map((i: any) => i.message)
        .join(".");
      return res.status(400).json(util.helpers.sendError(errorMessage));
    }

    const { user_id, shipment_num, status, message } = req.body;

    let user = await db.dbs.Users.findOne({ where: { id: user_id } });

    if (!user) {
      return res.status(400).json(util.helpers.sendError("User not found"));
    }

    let shipment = await db.dbs.ShippingItems.findOne({
      where: { shipment_num: shipment_num },
    });

    if (!shipment) {
      return res
        .status(400)
        .json(util.helpers.sendError("Shipments not found"));
    }

    let transactionChecker = await db.dbs.Transactions.findOne({
      where: { shipment_no: shipment_num },
    });

    if (transactionChecker.status === "pending") {
      return res
        .status(400)
        .json(util.helpers.sendError("Transaction already declined"));
    }

    if (status === "Approve") {
      await db.dbs.ShippingItems.update(
        { payment_status: "success" },
        { where: { shipment_num: shipment_num } }
      );

      await db.dbs.PaymentProofs.update(
        { status: "success" },
        { where: { shipment_num: shipment_num } }
      );

      await db.dbs.ShippingItems.update(
        { status: "upcoming" },
        {
          where: {
            shipment_num: shipment_num,
          },
        }
      );

      await db.dbs.Transactions.update(
        { status: "success" },
        { where: { shipment_no: shipment_num } }
      );

      if (message) {
        const option = {
          name: user.first_name + " " + user.last_name,
          email: user.email,
          message: message,
          subect: "Payment Approved"
          // message: `This is to inform you that your shipments with shipment number ${shipment_num} has been approved successfully`,
        };

        util.paymentApproval.sendMail(option);
      } else {
        const option = {
          name: user.first_name + " " + user.last_name,
          email: user.email,
          message: `This is to inform you that your shipments with shipment number ${shipment_num} has been approved successfully`,
          subect: "Payment Approved",
        };

        util.paymentApproval.sendMail(option);
      }

      let paymentProof = await db.dbs.PaymentProofs.findOne({
        where: { shipment_num: shipment_num },
      });

      await db.dbs.AuditLogs.create({
        uuid: util.uuid(),
        user_id: req.user.id,
        description: `Admin ${req.user.first_name} ${req.user.last_name} approved a payment with payment proof with id ${paymentProof.uuid}`,
        data: JSON.stringify(req.body),
      });

      const opts2 = {
        name: shipment.reciever_firstname + " " + shipment.reciever_lastname,
        email: shipment.reciever_email,
        shipment_num: shipment.shipment_num,
        shipper_name: shipment.shipperName,
        arrival_date: shipment.arrival_date,
      };

      const opts3 = {
        email: user.email,
        name: user.shipperName,
        amount: transactionChecker.amount,
        shipment_ref: shipment.booking_reference,
      };
      util.reciever.sendMail(opts2);
      util.paymentSuccess.sendMail(opts3);
      util.helpers.parkingListMail(shipment_num);

      return res
        .status(200)
        .json(util.helpers.sendSuccess("payment successfully approved"));
    }

    await db.dbs.Transactions.update(
      { status: "pending" },
      { where: { shipment_no: shipment_num } }
    );

    if (message) {
      const option = {
        name: user.first_name + " " + user.last_name,
        email: user.email,
        message: message,
      };

      util.paymentApproval.sendMail(option);
    } else {
      const option = {
        name: user.first_name + " " + user.last_name,
        email: user.email,
        message: `This is to inform you that your shipments with shipment number ${shipment_num} was rejected, kindly review document uploaded and re-upload a new and valid payment document`,
      };
      util.paymentApproval.sendMail(option);
    }

    let paymentProof = await db.dbs.PaymentProofs.findOne({
      where: { shipment_num: shipment_num },
    });

    await db.dbs.AuditLogs.create({
      uuid: util.uuid(),
      user_id: req.user.id,
      description: `Admin ${req.user.first_name} ${req.user.last_name} disapproved a payment with payment proof with id ${paymentProof.uuid}`,
      data: JSON.stringify(req.body),
    });

    return res
      .status(200)
      .json(util.helpers.sendSuccess("payment successfully rejected"));
  },

  pendingPayments: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    let pendingPayments = await db.dbs.Transactions.findAll({
      where: { status: "pending_verification" },
    });

    return res.status(200).json({ pendingPayments });
  },
};
