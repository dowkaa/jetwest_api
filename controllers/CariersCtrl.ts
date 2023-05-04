export {};
import { Request, Response, NextFunction } from "express";
const util = require("../utils/packages");
const db = require("../database/mysql");
const { paginate } = require("paginate-info");
const { Op, QueryTypes } = require("sequelize");

const signTokens = (user: any, token: string) => {
  var token: string = util.jwt.sign(
    {
      id: user.id,
      email: user.email,
      fullname: user.fullname,
      conpany_name: user.conpany_name,
      phone_number: user.phone_number,
      otp: user.otp,
    },
    process.env.SECRET,
    {
      expiresIn: 1800,
    }
  );
  var decoded = util.jwt_decode(token);
  db.dbs.Oauth.create(decoded);
  return token;
};

module.exports = {
  Login: async (req: Request, res: Response, next: NextFunction) => {
    const loginSchema = util.Joi.object()
      .keys({
        email: util.Joi.string().required(),
        password: util.Joi.string().required(),
      })
      .unknown();

    const validate = loginSchema.validate(req.body);

    if (validate.error != null) {
      const errorMessage = validate.error.details
        .map((i: any) => i.message)
        .join(".");
      return res.status(400).json(util.helpers.sendError(errorMessage));
    }

    const { email, password } = req.body;

    let user = await db.dbs.Users.findOne({
      where: { email, type: "Carrier" },
    });

    if (!user) {
      return res
        .status(400)
        .json(util.helpers.sendError("Account does not exist"));
    }

    if (user.verification_status !== "completed") {
      return res
        .status(400)
        .json(
          util.helpers.sendError(
            "Account not verified, kindly contact system admin."
          )
        );
    }

    // if (user.reg_status !== "completed") {
    //   return res.status(400).json({
    //     status: "ERROR",
    //     message: "Registration not completed",
    //     email: user.email,
    //     login_status: user.reg_status,
    //     account_type: user.type,
    //   });
    // }

    if (user.activated == 0) {
      const code = user.otp;

      // setTimeout(async () => {
      //   user.otp = null;
      //   await user.save();
      // }, 40000);

      const option = {
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        message: `Thanks for joining the Dowkaa team, we promise to serve your shiping needs. <br /> Kindly use the token ${code} to activate your account. <br /><br /> Thanks.`,
      };

      try {
        util.welcome.sendMail(option);
      } catch (error) {
        console.log({ error });
      }

      util.helpers.deactivateOtp(email);

      await user.save();

      // welcomes.sendMail(option);
      // return res
      //   .status(400)
      //   .json(
      //     utill.helpers.sendError(
      //       "Account has not been activated, kindly activate account with otp code sent to your email"
      //     )
      //   );
    }

    if (util.bcrypt.compareSync(password, user.password)) {
      if (user.locked === 1) {
        return res.status(400).json({
          status: "ERROR",
          code: "01",
          message: "Your account has been locked, kindly contact support",
        });
      }

      if (user.is_Admin === 1) {
        if (user.status !== "Active") {
          return res.status(400).json({
            status: "ERROR",
            code: "01",
            message:
              "Your account has been deactivated, kindly contact super admin",
          });
        }
      }

      if (user.verification_status === "declined") {
        return res.status(400).json({
          status: "ERROR",
          code: "01",
          message: "Your account has been declined, kindly contact support",
        });
      }

      const opt = {
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
      };

      if (parseInt(user.login_count) === 0) {
        util.introduction.sendMail(opt);
      }
      user.login_count = parseInt(user.login_count) + 1;
      await user.save();

      let random = util.uuid();

      const token = signTokens(user, random);

      if (user.type === "Carrier") {
        let cargo = await db.dbs.Cargo.findOne({
          where: { owner_id: { [Op.or]: [user.uuid, user.id] } },
        });

        if (!cargo) {
          return res.status(200).json({
            success: {
              token,
              email: user.email,
              login_status: user.reg_status,
              account_type: user.type,
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
            },
          });
        }

        var totalCompletedShipments = await db.dbs.ShippingItems.count({
          where: {
            cargo_id: { [Op.or]: [cargo.uuid, cargo.id] },
            status: "completed",
          },
          order: [["id", "DESC"]],
        });

        var totalCancelled = await db.dbs.ShippingItems.count({
          where: {
            cargo_id: { [Op.or]: [cargo.uuid, cargo.id] },
            status: "cancelled",
          },
          order: [["id", "DESC"]],
        });

        const totalSuccessfullTransactionsAmount =
          await db.dbs.Transactions.findAll({
            where: {
              cargo_id: { [Op.or]: [cargo.uuid, cargo.id] },
              status: "success",
            },
            attributes: [
              [
                util.sequelize.fn(
                  "sum",
                  util.sequelize.col("amount_in_dollars")
                ),
                "total_amount",
              ],
            ],
            raw: true,
          });

        const totalkg = await db.dbs.ShippingItems.findAll({
          where: { cargo_id: { [Op.or]: [cargo.uuid, cargo.id] } },
          attributes: [
            [
              util.sequelize.fn("sum", util.sequelize.col("chargeable_weight")),
              "totalKg",
            ],
          ],
          raw: true,
        });

        return res.status(200).json({
          success: {
            token,
            email: user.email,
            login_status: user.reg_status,
            account_type: user.type,
            totalCompletedShipments,
            totalSuccessfullTransactionsAmount,
            totalCancelled,
            totalkg,
          },
        });
      } else {
        return res.status(400).json({
          status: "ERROR",
          code: "01",
          message: "Authorised...",
        });
      }
    }

    return res.status(400).json({
      status: "ERROR",
      code: "01",
      message: "Incorrect email or password",
    });
  },
  estimateData: async (req: any, res: Response, next: NextFunction) => {
    let checker = await db.dbs.Users.findOne({
      where: { uuid: req.user.uuid, type: "Carrier" },
    });
    if (!checker) {
      return res
        .status(400)
        .json(util.helpers.sendError("Non carriers are not allowed here"));
    }

    if (checker.verification_status !== "completed") {
      return res
        .status(400)
        .json(
          util.helpers.sendError(
            "Account not verified, kindly contact system admin."
          )
        );
    }

    let cargo = await db.dbs.Cargo.findOne({
      where: { owner_id: { [Op.or]: [req.user.uuid, req.user.id] } },
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

    const totalSuccessfullTransactionsAmount =
      await db.dbs.Transactions.findAll({
        where: {
          [Op.or]: [{ cargo_id: cargo.id }, { cargo_id: cargo.uuid }],
          status: "success",
        },
        attributes: [
          [
            util.sequelize.fn("sum", util.sequelize.col("amount")),
            "total_amount",
          ],
        ],
        raw: true,
      });

    const totalkg = await db.dbs.ShippingItems.findAll({
      where: { [Op.or]: [{ cargo_id: cargo.id }, { cargo_id: cargo.uuid }] },
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

    if (checker.verification_status !== "completed") {
      return res
        .status(400)
        .json(
          util.helpers.sendError(
            "Account not verified, kindly contact system admin."
          )
        );
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
      where: { aircraft_owner: { [Op.or]: [checker.uuid, checker.id] } },
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

    if (checker.verification_status !== "completed") {
      return res
        .status(400)
        .json(
          util.helpers.sendError(
            "Account not verified, kindly contact system admin."
          )
        );
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
        aircraft_owner: { [Op.or]: [checker.uuid, checker.id] },
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

    if (checker.verification_status !== "completed") {
      return res
        .status(400)
        .json(
          util.helpers.sendError(
            "Account not verified, kindly contact system admin."
          )
        );
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
        aircraft_owner: { [Op.or]: [checker.uuid, checker.id] },
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
    let { uuid, date } = req.query;

    if (!(date && uuid)) {
      return res
        .status(400)
        .json(
          util.helpers.sendError(
            "Kindly add a valid date and a valid schedule unique id"
          )
        );
    }

    let checker = util.appCache.has("get-user-from-schedule" + uuid);
    let user;

    if (checker) {
      user = util.appCache.get("get-user-from-schedule" + uuid);
    } else {
      user = await db.dbs.Users.findOne({
        where: { uuid: req.user.uuid, verification_status: "completed" },
      });
      util.appCache.set("get-user-from-schedule" + uuid, user);
    }

    if (user.type !== "Carrier") {
      return res
        .status(400)
        .json(
          util.helpers.sendError(
            "Unauthorized API call, Kindly login with a carrier account"
          )
        );
    }

    if (user.verification_status !== "completed") {
      return res
        .status(400)
        .json(
          util.helpers.sendError(
            "Account not verified, kindly contact system admin."
          )
        );
    }

    if (!uuid) {
      return res
        .status(400)
        .json(util.helpers.sendError("Kindly add a valid scheduled flight id"));
    }

    let itemChecker = util.appCache.has("get-item-from-schedule" + uuid);
    let item;

    if (itemChecker) {
      item = util.appCache.get("get-item-from-schedule" + uuid);
    } else {
      item = await db.dbs.ScheduleFlights.findOne({ where: { uuid: uuid } });
      util.appCache.set("get-item-from-schedule" + uuid, item);
    }

    if (!item) {
      return res
        .status(400)
        .json(util.helpers.sendError("Scheduled flight with uuid not found"));
    }

    if (JSON.parse(item.departure_date.includes(date))) {
      let checker = util.appCache.has(req.url + item.id);
      let users;
      if (checker) {
        users = util.appCache.get(req.url + item.id);
      } else {
        users = await db.dbs.Users.findAll({
          attributes: {
            exclude: ["password", "otp", "locked", "activated"],
          },
          include: [
            {
              model: db.dbs.ShippingItems,
              where: { flight_id: item.id, depature_date: date },
              as: "shipments_booked_on_flight",
              required: true,
              include: [
                {
                  model: db.dbs.Users,
                  as: "agents",
                  distinct: true,
                  attributes: {
                    exclude: ["password", "otp", "locked", "activated"],
                  },
                },
              ],
            },
            {
              model: db.dbs.AirWayBill,
              where: { flight_reg: item.flight_reg },
              as: "airway_bill",
            },
          ],
          // order: [["createdAt", "DESC"]],
        });
        util.appCache.set(req.url + item.id, users);
      }

      return res.status(200).json({ users });
    }
    return res
      .status(400)
      .json(util.helpers.sendError(`Schedule flight on ${date} not found`));
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
          allLogistics.push(obj);
        });
      });

    return res.status(200).json({ allLogistics });
  },

  addShipmentWayBill: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const waybillSchema = util.Joi.object()
      .keys({
        doc_url: util.Joi.string().required(),
        doc_id: util.Joi.string().required(),
        shipment_num: util.Joi.string().required(),
      })
      .unknown();

    const validate = waybillSchema.validate(req.body);

    if (validate.error != null) {
      const errorMessage = validate.error.details
        .map((i: any) => i.message)
        .join(".");
      return res.status(400).json(util.helpers.sendError(errorMessage));
    }

    let user = await db.dbs.Users.findOne({
      where: { uuid: req.user.uuid, verification_status: "completed" },
    });

    if (user.type !== "Carrier") {
      return res
        .status(400)
        .json(util.helpers.sendError("Unauthorized API call"));
    }

    if (user.verification_status !== "completed") {
      return res
        .status(400)
        .json(
          util.helpers.sendError(
            "Account not verified, kindly contact system admin."
          )
        );
    }

    const { doc_url, doc_id, shipment_num } = req.body;

    let checker = await db.dbs.AirWayBill.findOne({
      where: {
        doc_url: doc_url,
        doc_id: doc_id,
        shipment_num: shipment_num,
      },
    });

    if (checker) {
      return res
        .status(400)
        .json(util.helpers.sendError("Airway-bill already added"));
    }

    let shipment = await db.dbs.ShippingItems.findOne({
      where: { shipment_num: shipment_num },
    });

    if (!shipment) {
      return res
        .status(400)
        .json(util.helpers.sendError("Shipment with unique id not found"));
    }

    let v = await db.dbs.ScheduleFlights.findOne({
      where: {
        id: shipment.flight_id,
      },
    });

    if (!v) {
      return res
        .status(400)
        .json(util.helpers.sendError("Scheduled flight not found"));
    }

    let cargo = await db.dbs.Cargo.findOne({
      where: { flight_reg: v.flight_reg },
    });

    if (!cargo) {
      return res.status(400).json(util.helpers.sendError("Cargo not found"));
    }

    let AirWayBillChecker = await db.dbs.AirWayBill.findOne({
      where: { shipment_num: shipment_num },
    });

    if (!AirWayBillChecker) {
      await db.dbs.AirWayBill.create({
        uuid: util.uuid(),
        user_id: req.user.id,
        carrier_id: req.user.id,
        doc_id: doc_id,
        doc_url: doc_url,
        shipper_id: shipment.user_id,
        shipment_id: shipment.id,
        flight_reg: cargo.flight_reg,
        shipment_num: shipment_num,
        agent_id: shipment.agent_id,
      });

      return res
        .status(200)
        .json(util.helpers.sendSuccess("Airway-bill uploaded successfully"));
    } else {
      AirWayBillChecker.doc_id = doc_id;
      AirWayBillChecker.doc_url = doc_url;
      await AirWayBillChecker.save();
      return res
        .status(200)
        .json(util.helpers.sendSuccess("Airway-bill updated successfully"));
    }
  },
};
