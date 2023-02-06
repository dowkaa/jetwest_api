import { Request, Response, NextFunction } from "express";
const util = require("../utils/packages");
const db = require("../database/mysql");
const { paginate } = require("paginate-info");
const { Op, QueryTypes } = require("sequelize");

module.exports = {
  estimateData: async (req: any, res: Response, next: NextFunction) => {
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
        totalAmount: [
          {
            total_amount: 0,
          },
        ],
        totalCancelled: 0,
        totalkg: [
          {
            totalKg: 0,
          },
        ],
      });
    }

    var totalCompletedShipments = await db.dbs.ShippingItems.count({
      where: { cargo_id: cargo.uuid, status: "completed" },
      order: [["id", "DESC"]],
    });

    var totalCancelled = await db.dbs.ShippingItems.count({
      where: { cargo_id: cargo.uuid, status: "cancelled" },
      order: [["id", "DESC"]],
    });

    const totalSuccessfullTransactionsAmount =
      await db.dbs.Transactions.findAll({
        where: { cargo_id: cargo.uuid, status: "success" },
        attributes: [
          [
            util.sequelize.fn("sum", util.sequelize.col("amount")),
            "total_amount",
          ],
        ],
        raw: true,
      });

    const totalkg = await db.dbs.ShippingItems.findAll({
      where: { cargo_id: cargo.uuid },
      attributes: [
        [
          util.sequelize.fn("sum", util.sequelize.col("chargeable_weight")),
          "totalKg",
        ],
      ],
      raw: true,
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
      where: { aircraft_owner: checker.uuid },
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
      where: { aircraft_owner: checker.uuid, status: "completed" },
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
      where: { aircraft_owner: checker.uuid, status: "enroute" },
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
      last_page: meta.pageCount, //transactions.count,
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
    let uuid = req.query.uuid;

    if (!uuid) {
      return res
        .status(400)
        .json(util.helpers.sendError("Kindly add a valid scheduled flight id"));
    }

    let shippingItems = await db.dbs.ShippingItems.findAll({
      where: { flight_id: uuid },
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
