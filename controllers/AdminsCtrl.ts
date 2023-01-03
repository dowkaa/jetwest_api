export {};
import { NextFunction, response, Response } from "express";
const utill = require("../utils/packages");
const { paginate } = require("paginate-info");
const { Op, QueryTypes } = require("sequelize");
const db = require("../database/mysql");

module.exports = {
  createAdmin: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const loginSchema = utill.Joi.object()
      .keys({
        first_name: utill.Joi.string().required(),
        last_name: utill.Joi.string().required(),
        email: utill.Joi.string().required(),
        password: utill.Joi.string().required(),
        role_id: utill.Joi.string().required(),
      })
      .unknown();

    const validate = loginSchema.validate(req.body);

    if (validate.error != null) {
      const errorMessage = validate.error.details
        .map((i: any) => i.message)
        .join(".");
      return res.status(400).json(utill.helpers.sendError(errorMessage));
    }

    let user = await db.dbs.Users.findOne({ where: { uuid: req.user.uuid } });

    if (parseInt(user.is_Admin) != 1) {
      return res
        .status(400)
        .json(
          utill.helpers.sendError(
            "Unauthorised access, Kindly contact system admin"
          )
        );
    }

    if (user.admin_type !== "Super Admin") {
      return res
        .status(400)
        .json(utill.helpers.sendError("Access denied for current admin type"));
    }

    const { first_name, last_name, email, password, role_id } = req.body;

    let checker = await db.dbs.Users.findOne({ where: { email: email } });

    if (checker) {
      return res
        .status(400)
        .json(utill.helpers.sendError("User with email already exists"));
    }

    let roles = await db.dbs.Roles.findOne({
      where: { uuid: role_id },
    });

    if (!roles) {
      return res
        .status(400)
        .json(utill.helpers.sendError("Role does not exist"));
    }

    await db.dbs.Users.create({
      uuid: utill.uuid(),
      first_name,
      last_name,
      email,
      password: utill.bcrypt.hashSync(password),
      is_Admin: 1,
      status: "Active",
      role_id: roles.uuid,
      type: "Admin",
      admin_type: roles.name,
      roles: roles.permissions,
    });

    const option = {
      name: `${first_name} ${last_name}`,
      email: email,
      message: `Kindly use the password ${password} to login to the dowkaa admin dashboard by clicking on the button below. Thanks.`,
    };

    await db.dbs.AuditLogs.create({
      uuid: utill.uuid(),
      user_id: req.user.uuid,
      description: `Admin ${req.user.first_name} ${req.user.last_name} added an admin with role ${roles.name}`,
    });

    utill.welcome.sendMail(option);

    return res
      .status(200)
      .json(utill.helpers.sendSuccess("Admin user added successfully"));
  },

  allPermissions: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    let permissions = await db.dbs.Permissions.findOne();

    return res.status(200).json({ permissions });
  },
  permissions: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const loginSchema = utill.Joi.object()
      .keys({
        type: utill.Joi.string().required(),
        items: utill.Joi.array().required(),
      })
      .unknown();

    const validate = loginSchema.validate(req.body);

    if (validate.error != null) {
      const errorMessage = validate.error.details
        .map((i: any) => i.message)
        .join(".");
      return res.status(400).json(utill.helpers.sendError(errorMessage));
    }

    const { type, items } = req.body;

    let checker = await db.dbs.Permissions.findOne({ where: { type: type } });

    if (checker) {
      return res
        .status(400)
        .json(
          utill.helpers.sendError(
            `permission with type ${type} already created`
          )
        );
    }

    await db.dbs.Permissions.create({
      uuid: utill.uuid(),
      type: type,
      permissions: JSON.stringify(items),
    });

    await db.dbs.AuditLogs.create({
      uuid: utill.uuid(),
      user_id: req.user.uuid,
      description: `Admin ${req.user.first_name} ${req.user.last_name} created a permission of type ${type}`,
    });

    return res
      .status(200)
      .json(
        utill.helpers.sendSuccess(`Successfully created ${type} permissions`)
      );
  },

  changePassword: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const loginSchema = utill.Joi.object()
      .keys({
        email: utill.Joi.string().required(),
        role_id: utill.Joi.string().required(),
        password: utill.Joi.string().required(),
      })
      .unknown();

    const validate = loginSchema.validate(req.body);

    if (validate.error != null) {
      const errorMessage = validate.error.details
        .map((i: any) => i.message)
        .join(".");
      return res.status(400).json(utill.helpers.sendError(errorMessage));
    }

    const { email, role_id, password } = req.body;

    let checker = await db.dbs.Users.findOne({
      where: { email: email, roles: role_id },
    });

    if (!checker) {
      return res.status(400).json(utill.helpers.sendError("Admin not found"));
    }

    checker.password = utill.bcrypt.hashSync(password);
    await checker.save();

    const option = {
      name: `${checker.first_name} ${checker.last_name}`,
      email: checker.email,
      message:
        "Kindly login with the password sent to your email and update to any password of your choice. Kindly note that this password expires in 10 minutes",
    };

    utill.changeAdminPassword(option);

    utill.helpers.deactivatePassword(checker.email);

    await db.dbs.AuditLogs.create({
      uuid: utill.uuid(),
      user_id: req.user.uuid,
      description: `Admin ${req.user.first_name} ${req.user.last_name} updated ${checker.first_name} ${checker.last_name}'s admin password
`,
    });

    // Admin ${req.user.first_name} ${req.user.last_name} updated ${checker.first_name} ${checker.last_name}'s admin password

    return res
      .status(200)
      .json(
        utill.helpers.sendSuccess("Admin user's password updated successfully")
      );
  },

  scheduleFlights: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const loginSchema = utill.Joi.object()
      .keys({
        departure_station: utill.Joi.string().required(), // e.g name of state
        departure_date: utill.Joi.string().required(),
        destination_station: utill.Joi.string().required(), // e.g name of state
        flight_reg: utill.Joi.string().required(),
        arrival_date: utill.Joi.string().required(),
        scheduled_payload: utill.Joi.string().required(),
        stod: utill.Joi.string().required(),
        stoa: utill.Joi.string().required(),
        status: utill.Joi.string().required(),
        duration: utill.Joi.string().required(),
      })
      .unknown();

    const validate = loginSchema.validate(req.body);

    if (validate.error != null) {
      const errorMessage = validate.error.details
        .map((i: any) => i.message)
        .join(".");
      return res.status(400).json(utill.helpers.sendError(errorMessage));
    }

    let user = await db.dbs.Users.findOne({ where: { uuid: req.user.uuid } });

    if (parseInt(user.is_Admin) != 1) {
      return res
        .status(400)
        .json(
          utill.helpers.sendError(
            "Unauthorised access, Kindly contact system admin"
          )
        );
    }

    if (
      !(
        user.admin_type === "Flight Operator" ||
        user.admin_type === "Super Admin"
      )
    ) {
      return res
        .status(400)
        .json(utill.helpers.sendError("Access denied for current admin type"));
    }
    const {
      departure_station,
      flight_reg,
      stod,
      stoa,
      status,
      duration,
      scheduled_payload,
      arrival_date,
      departure_date,
      destination_station,
    } = req.body;

    let aircraftChecker = await db.dbs.Cargo.findOne({
      where: { flight_reg: flight_reg },
    });

    if (!aircraftChecker) {
      return res
        .status(400)
        .json(
          utill.helpers.sendError(
            "Aircraft with provided flight registration id not found"
          )
        );
    }

    await db.dbs.ScheduleFlights.create({
      uuid: utill.uuid(),
      user_id: req.user.registrationId,
      departure_station,
      flight_reg,
      stod,
      stoa,
      status,
      duration,
      scheduled_payload,
      arrival_date,
      departure_date,
      destination_station,
    });

    await db.dbs.AuditLogs.create({
      uuid: utill.uuid(),
      user_id: req.user.uuid,
      description: `Admin ${req.user.first_name} ${req.user.last_name} added a flight schedule
`,
    });

    return res
      .status(200)
      .json(
        utill.helpers.sendSuccess("You have successfully scheduled a flight")
      );
  },

  allScheduledFlights: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    // let allFlights = await db.dbs.ScheduleFlights.findAll({});

    // return res.status(200).json({ allFlights });

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

    let allFlights = await db.dbs.ScheduleFlights.findAndCountAll({
      offset: offset,
      limit: limit,
      order: [["id", "DESC"]],
    });

    var next_page = currentPage + 1;
    var prev_page = currentPage - 1;
    var nextP = `/api/jetwest/admin/all-scheduled-flights?pageNum=` + next_page;
    var prevP = `/api/jetwest/admin/all-scheduled-flights?pageNum=` + prev_page;

    const meta = paginate(
      currentPage,
      allFlights.count,
      allFlights.rows,
      pageSize
    );

    return res.status(200).json({
      status: "SUCCESS",
      data: allFlights,
      per_page: pageSize,
      current_page: currentPage,
      last_page: meta.pageCount, //transactions.count,
      first_page_url: `/api/jetwest/admin/all-scheduled-flights?pageNum=1`,
      last_page_url:
        `/api/jetwest/admin/all-scheduled-flights?pageNum=` + meta.pageCount, //transactions.count,
      next_page_url: nextP,
      prev_page_url: prevP,
      path: `/api/jetwest/admin/all-scheduled-flights?pageNum=`,
      from: 1,
      to: meta.pageCount, //transactions.count,
    });
  },

  flightsInProgress: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    // let flights = await db.dbs.ScheduleFlights.findAll({
    //   where: { status: "In progress" },
    // });

    // return res.status(200).json({ data: flights });

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

    let flights = await db.dbs.ScheduleFlights.findAndCountAll({
      offset: offset,
      limit: limit,
      where: { status: "In progress" },
      order: [["id", "DESC"]],
    });

    var next_page = currentPage + 1;
    var prev_page = currentPage - 1;
    var nextP = `/api/jetwest/admin/flights-in-progress?pageNum=` + next_page;
    var prevP = `/api/jetwest/admin/flights-in-progress?pageNum=` + prev_page;

    const meta = paginate(currentPage, flights.count, flights.rows, pageSize);

    return res.status(200).json({
      status: "SUCCESS",
      data: flights,
      per_page: pageSize,
      current_page: currentPage,
      last_page: meta.pageCount, //transactions.count,
      first_page_url: `/api/jetwest/admin/flights-in-progress?pageNum=1`,
      last_page_url:
        `/api/jetwest/admin/flights-in-progress?pageNum=` + meta.pageCount, //transactions.count,
      next_page_url: nextP,
      prev_page_url: prevP,
      path: `/api/jetwest/admin/flights-in-progress?pageNum=`,
      from: 1,
      to: meta.pageCount, //transactions.count,
    });
  },

  flightsCompleted: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    // let flights = await db.dbs.ScheduleFlights.findAll({
    //   where: { status: "completed" },
    // });
    // return res.status(200).json({ data: flights });

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

    let flights = await db.dbs.ScheduleFlights.findAndCountAll({
      offset: offset,
      limit: limit,
      where: { status: "completed" },
      order: [["id", "DESC"]],
    });

    var next_page = currentPage + 1;
    var prev_page = currentPage - 1;
    var nextP = `/api/jetwest/admin/completed-flights?pageNum=` + next_page;
    var prevP = `/api/jetwest/admin/completed-flights?pageNum=` + prev_page;

    const meta = paginate(currentPage, flights.count, flights.rows, pageSize);

    return res.status(200).json({
      status: "SUCCESS",
      data: flights,
      per_page: pageSize,
      current_page: currentPage,
      last_page: meta.pageCount, //transactions.count,
      first_page_url: `/api/jetwest/admin/completed-flights?pageNum=1`,
      last_page_url:
        `/api/jetwest/admin/completed-flights?pageNum=` + meta.pageCount, //transactions.count,
      next_page_url: nextP,
      prev_page_url: prevP,
      path: `/api/jetwest/admin/completed-flights?pageNum=`,
      from: 1,
      to: meta.pageCount, //transactions.count,
    });
  },

  singleFlight: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    let uuid = req.query.uuid;

    if (!uuid) {
      return res
        .status(400)
        .json(utill.helpers.sendError("Kindly add a valid search parameter"));
    }
    let flights = await db.dbs.ScheduleFlights.findOne({
      where: { uuid: uuid },
    });

    return res.status(200).json({ data: flights });
  },

  createDestination: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const loginSchema = utill.Joi.object()
      .keys({
        country: utill.Joi.string().required(),
        destination_name: utill.Joi.string().required(), // state
        code: utill.Joi.string().required(),
        name_of_airport: utill.Joi.string().required(),
        groundHandler: utill.Joi.string().required(),
        email: utill.Joi.string().required(),
        phone_number: utill.Joi.string().required(),
      })
      .unknown();

    const validate = loginSchema.validate(req.body);

    if (validate.error != null) {
      const errorMessage = validate.error.details
        .map((i: any) => i.message)
        .join(".");
      return res.status(400).json(utill.helpers.sendError(errorMessage));
    }

    const {
      country,
      destination_name,
      code,
      name_of_airport,
      groundHandler,
      email,
      phone_number,
    } = req.body;

    let user = await db.dbs.Users.findOne({ where: { uuid: req.user.uuid } });

    if (parseInt(user.is_Admin) != 1) {
      return res
        .status(400)
        .json(
          utill.helpers.sendError(
            "Unauthorised access, Kindly contact system admin"
          )
        );
    }

    console.log({ adminType: user.admin_type });

    if (
      !(
        user.admin_type === "Flight Operator" ||
        user.admin_type === "Super Admin"
      )
    ) {
      return res
        .status(400)
        .json(utill.helpers.sendError("Access denied for current admin type"));
    }

    let data = await db.dbs.Destinations.create({
      uuid: utill.uuid(),
      country,
      state: destination_name,
      code,
      name_of_airport,
      groundHandler,
      email,
      phone_number,
    });

    await db.dbs.AuditLogs.create({
      uuid: utill.uuid(),
      user_id: req.user.uuid,
      description: `Admin ${req.user.first_name} ${req.user.last_name} created a destination with uuid ${data.uuid}
`,
    });

    return res
      .status(200)
      .json(
        utill.helpers.sendSuccess("You have successfully added a destination")
      );
  },

  allShipmentRoutes: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    // let data = await db.dbs.ShipmentRoutes.findAll({});

    // return res.status(200).json({ destinations: data });

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

    let destinations = await db.dbs.ShipmentRoutes.findAndCountAll({
      offset: offset,
      limit: limit,
      order: [["id", "DESC"]],
    });

    var next_page = currentPage + 1;
    var prev_page = currentPage - 1;
    var nextP = `/api/jetwest/admin/all-destinations?pageNum=` + next_page;
    var prevP = `/api/jetwest/admin/all-destinations?pageNum=` + prev_page;

    const meta = paginate(
      currentPage,
      destinations.count,
      destinations.rows,
      pageSize
    );

    return res.status(200).json({
      status: "SUCCESS",
      data: destinations,
      per_page: pageSize,
      current_page: currentPage,
      last_page: meta.pageCount, //transactions.count,
      first_page_url: `/api/jetwest/admin/all-destinations?pageNum=1`,
      last_page_url:
        `/api/jetwest/admin/all-destinations?pageNum=` + meta.pageCount, //transactions.count,
      next_page_url: nextP,
      prev_page_url: prevP,
      path: `/api/jetwest/admin/all-destinations?pageNum=`,
      from: 1,
      to: meta.pageCount, //transactions.count,
    });
  },

  createRoute: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const loginSchema = utill.Joi.object()
      .keys({
        departure: utill.Joi.string().required(), // this is a destination e.g Lagos
        destination: utill.Joi.string().required(), // this is a destination e.g Port Harcourt
        dollarPerKg: utill.Joi.number().required(),
        dailyExchangeRate: utill.Joi.number().required(),
        value: utill.Joi.number().required(),
        tax: utill.Joi.string().required(),
        interest: utill.Joi.number().required(),
        surcharge: utill.Joi.number().required(),
      })
      .unknown();

    const validate = loginSchema.validate(req.body);

    if (validate.error != null) {
      const errorMessage = validate.error.details
        .map((i: any) => i.message)
        .join(".");
      return res.status(400).json(utill.helpers.sendError(errorMessage));
    }

    let user = await db.dbs.Users.findOne({ where: { uuid: req.user.uuid } });

    if (parseInt(user.is_Admin) != 1) {
      return res
        .status(400)
        .json(
          utill.helpers.sendError(
            "Unauthorised access, Kindly contact system admin"
          )
        );
    }

    if (
      !(
        user.admin_type === "Flight Operator" ||
        user.admin_type === "Super Admin"
      )
    ) {
      return res
        .status(400)
        .json(utill.helpers.sendError("Access denied for current admin type"));
    }

    const {
      departure,
      destination,
      dollarPerKg,
      dailyExchangeRate,
      value,
      tax,
      interest,
      surcharge,
    } = req.body;

    // chec if departure exists on destination tables
    let departureCheck = await db.dbs.Destinations.findOne({
      where: { state: departure },
    });

    let destinationCheck = await db.dbs.Destinations.findOne({
      where: { state: destination },
    });

    if (!destinationCheck) {
      return res
        .status(400)
        .json(utill.helpers.sendError("Destination not found"));
    }

    if (!departureCheck) {
      return res
        .status(400)
        .json(utill.helpers.sendError("Departure not found"));
    }

    let checker = await db.dbs.ShipmentRoutes.findOne({
      where: { departure: departure, destination_name: destination },
    });

    if (checker) {
      return res
        .status(400)
        .json(utill.helpers.sendError("Route already created"));
    }
    // chec if destination exists on destination tables

    await db.dbs.ShipmentRoutes.create({
      uuid: utill.uuid(),
      route: departure + " to " + destination,
      ratePerKg: dollarPerKg,
      sur_charge: surcharge,
      tax: tax,
      departure,
      destination,
      dailyExchangeRate,
      value,
      interest,
      groundHandler: destinationCheck.groundHandler,
      email: destinationCheck.email,
      phone_number: destinationCheck.phone_number,
      destination_name: destination,
      departure_airport: departureCheck.name_of_airport,
      destination_airport: destinationCheck.name_of_airport,
    });

    await db.dbs.AuditLogs.create({
      uuid: utill.uuid(),
      user_id: req.user.uuid,
      description: `Admin ${req.user.first_name} ${req.user.last_name} created a route with departure ${departure} and destination $
      ${destination}`,
    });

    const option = {
      name: `${req.user.first_name} ${req.user.last_name}`,
      email: req.user.email,
      message: "This is to inform you that you have been assigned to ",
    };

    return res
      .status(200)
      .json(utill.helpers.sendSuccess("Route created successfully"));
  },
  updateRoute: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const loginSchema = utill.Joi.object()
      .keys({
        route_id: utill.Joi.string().required(),
        departure: utill.Joi.string().required(),
        destination: utill.Joi.string().required(),
        dollarPerKg: utill.Joi.number().required(),
        dailyExchangeRate: utill.Joi.number().required(),
        value: utill.Joi.number().required(),
        tax: utill.Joi.string().required(),
        interest: utill.Joi.number().required(),
        surcharge: utill.Joi.number().required(),
        groundHandler: utill.Joi.string().required(),
        email: utill.Joi.string().required(),
        phone_number: utill.Joi.string().required(),
      })
      .unknown();

    const validate = loginSchema.validate(req.body);

    if (validate.error != null) {
      const errorMessage = validate.error.details
        .map((i: any) => i.message)
        .join(".");
      return res.status(400).json(utill.helpers.sendError(errorMessage));
    }

    let user = await db.dbs.Users.findOne({ where: { uuid: req.user.uuid } });

    if (parseInt(user.is_Admin) != 1) {
      return res
        .status(400)
        .json(
          utill.helpers.sendError(
            "Unauthorised access, Kindly contact system admin"
          )
        );
    }

    if (
      !(
        user.admin_type === "Flight Operator" ||
        user.admin_type === "Super Admin"
      )
    ) {
      return res
        .status(400)
        .json(utill.helpers.sendError("Access denied for current admin type"));
    }

    const {
      departure,
      destination,
      route_id,
      dollarPerKg,
      dailyExchangeRate,
      value,
      tax,
      groundHandler,
      email,
      phone_number,
      interest,
      surcharge,
    } = req.body;

    let route = await db.dbs.ShipmentRoutes.findOne({
      where: { uuid: route_id },
    });

    if (!route) {
      return res.status(400).json(utill.helpers.sendError("Route not found"));
    }

    // await db.dbs.ShipmentRoutes.create({
    route.route = departure + " to " + destination;
    route.ratePerKg = dollarPerKg;
    route.sur_charge = surcharge;
    route.tax = tax;
    route.departure = departure;
    route.dailyExchangeRate = dailyExchangeRate;
    route.value = value;
    route.interest = interest;
    route.groundHandler = groundHandler;
    route.email = email;
    route.phone_number = phone_number;
    route.destination_name = destination;
    await route.save();
    // });

    await db.dbs.AuditLogs.create({
      uuid: utill.uuid(),
      user_id: req.user.uuid,
      description: `Admin ${req.user.first_name} ${
        req.user.last_name
      } updated a route with uuid ${route.uuid} with data ${JSON.stringify(
        req.body
      )}`,
    });

    return res
      .status(200)
      .json(utill.helpers.sendSuccess("Route updated successfully"));
  },

  deleteRoute: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    let uuid = req.query.uuid;
    if (!uuid) {
      return res
        .status(400)
        .json(utill.helpers.sendError("Kindly add a valid route id"));
    }

    let route = await db.dbs.ShipmentRoutes.findOne({ where: { uuid: uuid } });

    if (!route) {
      return res.status(400).json(utill.helpers.sendError("Route not found"));
    }

    await route.destroy();

    await db.dbs.AuditLogs.create({
      uuid: utill.uuid(),
      user_id: req.user.uuid,
      description: `Admin ${req.user.first_name} ${
        req.user.last_name
      } deleted a route with uuid ${route.uuid} and data ${JSON.stringify(
        route
      )}`,
    });

    return res
      .status(200)
      .json(
        utill.helpers.sendSuccess(
          `Route with uuid ${uuid} deleted successfully`
        )
      );
  },

  singleRoute: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    let uuid = req.query.uuid;
    if (!uuid) {
      return res
        .status(400)
        .json(utill.helpers.sendError("Kindly add a valid route id"));
    }

    let route = await db.dbs.ShipmentRoutes.findOne({ where: { uuid: uuid } });

    if (!route) {
      return res.status(400).json(utill.helpers.sendError("Route not found"));
    }

    return res.status(200).json({ route });
  },
  allRoutes: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
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

    var routes = await db.dbs.ShipmentRoutes.findAndCountAll({
      offset: offset,
      limit: limit,
      order: [["id", "DESC"]],
    });

    var next_page = currentPage + 1;
    var prev_page = currentPage - 1;
    var nextP = `/api/jetwest/admin/all-routes?pageNum=` + next_page;
    var prevP = `/api/jetwest/admin/all-routes?pageNum=` + prev_page;

    const meta = paginate(currentPage, routes.count, routes.rows, pageSize);

    return res.status(200).json({
      status: "SUCCESS",
      data: routes,
      per_page: pageSize,
      current_page: currentPage,
      last_page: meta.pageCount, //transactions.count,
      first_page_url: `/api/jetwest/admin/all-routes?pageNum=1`,
      last_page_url: `/api/jetwest/admin/all-routes?pageNum=` + meta.pageCount, //transactions.count,
      next_page_url: nextP,
      prev_page_url: prevP,
      path: `/api/jetwest/admin/all-routes?pageNum=`,
      from: 1,
      to: meta.pageCount, //transactions.count,
    });
  },

  createNewRole: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const loginSchema = utill.Joi.object()
      .keys({
        name: utill.Joi.string().required(),
        permissions: utill.Joi.array().required(),
      })
      .unknown();

    const validate = loginSchema.validate(req.body);

    if (validate.error != null) {
      const errorMessage = validate.error.details
        .map((i: any) => i.message)
        .join(".");
      return res.status(400).json(utill.helpers.sendError(errorMessage));
    }

    let user = await db.dbs.Users.findOne({ where: { uuid: req.user.uuid } });

    if (parseInt(user.is_Admin) != 1) {
      return res
        .status(400)
        .json(
          utill.helpers.sendError(
            "Unauthorised access, Kindly contact system admin"
          )
        );
    }

    if (user.admin_type !== "Super Admin") {
      return res
        .status(400)
        .json(utill.helpers.sendError("Access denied for current admin type"));
    }

    const { name, permissions } = req.body;
    // let checkPermission = await db.dbs.Permissions.findOne({
    //   where: { uuid: permission_id },
    // });

    // if (!checkPermission) {
    //   return res
    //     .status(400)
    //     .json(utill.helpers.sendError(`Permission does not exist`));
    // }

    // let checker = await db.dbs.Roles.findOne({ where: { name: name } });

    // if (checker) {
    //   return res
    //     .status(400)
    //     .json(utill.helpers.sendError(`Role with name ${name} aready exists`));
    // }

    await db.dbs.Roles.create({
      uuid: utill.uuid(),
      name,
      status: "Active",
      description: "Admin permissions",
      permissions: JSON.stringify(permissions),
    });

    console.log("1223344");

    await db.dbs.AuditLogs.create({
      uuid: utill.uuid(),
      user_id: req.user.uuid,
      description: `Admin ${req.user.first_name} ${req.user.last_name} created a role with name ${name}`,
    });

    console.log("556644");

    return res
      .status(200)
      .json(utill.helpers.sendSuccess("Roles added successfully"));
  },

  allAdmins: async (req: any, res: Response, next: NextFunction) => {
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

    var admin = await db.dbs.Users.findAndCountAll({
      offset: offset,
      limit: limit,
      where: { is_admin: 1 },
      order: [["id", "DESC"]],
    });

    var next_page = currentPage + 1;
    var prev_page = currentPage - 1;
    var nextP = `/api/jetwest/admin/all-admins?pageNum=` + next_page;
    var prevP = `/api/jetwest/admin/all-admins?pageNum=` + prev_page;

    const meta = paginate(currentPage, admin.count, admin.rows, pageSize);

    return res.status(200).json({
      status: "SUCCESS",
      data: admin,
      per_page: pageSize,
      current_page: currentPage,
      last_page: meta.pageCount, //transactions.count,
      first_page_url: `/api/jetwest/admin/all-admins?pageNum=1`,
      last_page_url: `/api/jetwest/admin/all-admins?pageNum=` + meta.pageCount, //transactions.count,
      next_page_url: nextP,
      prev_page_url: prevP,
      path: `/api/jetwest/admin/all-admins?pageNum=`,
      from: 1,
      to: meta.pageCount, //transactions.count,
    });
  },

  allRoles: async (req: any, res: Response, next: NextFunction) => {
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

    let user = await db.dbs.Users.findOne({ where: { uuid: req.user.uuid } });

    if (parseInt(user.is_Admin) != 1) {
      return res
        .status(400)
        .json(
          utill.helpers.sendError(
            "Unauthorised access, Kindly contact system admin"
          )
        );
    }

    if (!(user.admin_type === "Super Admin")) {
      return res
        .status(400)
        .json(utill.helpers.sendError("Access denied for current admin type"));
    }

    var roles = await db.dbs.Roles.findAndCountAll({
      offset: offset,
      limit: limit,
      order: [["id", "DESC"]],
    });

    //1`;

    var next_page = currentPage + 1;
    var prev_page = currentPage - 1;
    var nextP = `/api/jetwest/admin/all-roles?pageNum=` + next_page;
    var prevP = `/api/jetwest/admin/all-roles?pageNum=` + prev_page;

    const meta = paginate(currentPage, roles.count, roles.rows, pageSize);

    return res.status(200).json({
      status: "SUCCESS",
      data: roles,
      per_page: pageSize,
      current_page: currentPage,
      last_page: meta.pageCount, //transactions.count,
      first_page_url: `/api/jetwest/admin/all-roles?pageNum=1`,
      last_page_url: `/api/jetwest/admin/all-roles?pageNum=` + meta.pageCount, //transactions.count,
      next_page_url: nextP,
      prev_page_url: prevP,
      path: `/api/jetwest/admin/all-roles?pageNum=`,
      from: 1,
      to: meta.pageCount, //transactions.count,
    });
  },

  allAircrafts: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
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

    // const transactions = await db.dbs.User.findAndCountAll({
    //   offset: offset,
    //   limit: limit,
    //   // where: { user_id: req.user.id },
    //   order: [["id", "DESC"]],
    // });

    let user = await db.dbs.Users.findOne({ where: { uuid: req.user.uuid } });

    if (parseInt(user.is_Admin) != 1) {
      return res
        .status(400)
        .json(
          utill.helpers.sendError(
            "Unauthorised access, Kindly contact system admin"
          )
        );
    }

    if (
      !(
        user.admin_type === "Flight Operator" ||
        user.admin_type === "Super Admin"
      )
    ) {
      return res
        .status(400)
        .json(utill.helpers.sendError("Access denied for current admin type"));
    }

    var cargos = await db.dbs.Cargo.findAndCountAll({
      offset: offset,
      limit: limit,
      order: [["id", "DESC"]],
    });

    //1`;

    var next_page = currentPage + 1;
    var prev_page = currentPage - 1;
    var nextP = `/api/jetwest/admin/recent-cargos?pageNum=` + next_page;
    var prevP = `/api/jetwest/admin/recent-cargos?pageNum=` + prev_page;

    const meta = paginate(currentPage, cargos.count, cargos.rows, pageSize);

    return res.status(200).json({
      status: "SUCCESS",
      data: cargos,
      per_page: pageSize,
      current_page: currentPage,
      last_page: meta.pageCount, //transactions.count,
      first_page_url: `/api/jetwest/admin/recent-cargos?pageNum=1`,
      last_page_url:
        `/api/jetwest/admin/recent-cargos?pageNum=` + meta.pageCount, //transactions.count,
      next_page_url: nextP,
      prev_page_url: prevP,
      path: `/api/jetwest/admin/recent-cargos?pageNum=`,
      from: 1,
      to: meta.pageCount, //transactions.count,
    });
  },

  activateAircraft: async (req: any, res: Response, next: NextFunction) => {
    const loginSchema = utill.Joi.object()
      .keys({
        cargo_id: utill.Joi.string().required(),
        aircraft_type_checked: utill.Joi.boolean().required(),
        payload_checked: utill.Joi.boolean().required(),
        ops_spec_checked: utill.Joi.boolean().required(),
        flight_hrs_checked: utill.Joi.boolean().required(),
        aircraft_registration_checked: utill.Joi.boolean().required(),
        airworthiness_cert_status: utill.Joi.boolean().required(),
        airworthiness_cert_exp_checked: utill.Joi.boolean().required(),
        note: utill.Joi.string().required(),

        noise_cert_status: utill.Joi.boolean().required(),
        noise_cert_exp_checked: utill.Joi.boolean().required(),
        insurance_cert_status: utill.Joi.boolean().required(),
        insurance_cert_exp_checked: utill.Joi.boolean().required(),
        registration_cert_status: utill.Joi.boolean().required(),
        registration_cert_exp_checked: utill.Joi.boolean().required(),
        noteOne: utill.Joi.string().required(),

        maintenance_program_status: utill.Joi.boolean().required(),
        mmel_status: utill.Joi.boolean().required(),
        ops_manual_status: utill.Joi.boolean().required(),
        driveLink: utill.Joi.string().allow(""),
        status: utill.Joi.string().required(),
        noteTwo: utill.Joi.string().required(),
      })
      .unknown();

    const validate = loginSchema.validate(req.body);

    if (validate.error != null) {
      const errorMessage = validate.error.details
        .map((i: any) => i.message)
        .join(".");
      return res.status(400).json(utill.helpers.sendError(errorMessage));
    }

    const {
      cargo_id,
      airworthiness_cert_status,
      noise_cert_status,
      insurance_cert_status,
      registration_cert_status,
      maintenance_program_status,
      mmel_status,
      ops_manual_status,
      status,
      note,
      aircraft_type_checked,
      payload_checked,
      ops_spec_checked,
      flight_hrs_checked,
      aircraft_registration_checked,
      airworthiness_cert_exp_checked,
      noise_cert_exp_checked,
      insurance_cert_exp_checked,
      registration_cert_exp_checked,
      noteOne,
      driveLink,
      noteTwo,
    } = req.body;

    let user = await db.dbs.Users.findOne({ where: { uuid: req.user.uuid } });

    if (parseInt(user.is_Admin) != 1) {
      return res
        .status(400)
        .json(
          utill.helpers.sendError(
            "Unauthorised access, Kindly contact system admin"
          )
        );
    }

    if (
      !(
        user.admin_type === "Flight Operator" ||
        user.admin_type === "Super Admin"
      )
    ) {
      return res
        .status(400)
        .json(utill.helpers.sendError("Access denied for current admin type"));
    }
    console.log("kkkkkkkk");
    // return;

    let cargo = await db.dbs.Cargo.findOne({ where: { uuid: cargo_id } });

    if (!cargo) {
      return res
        .status(400)
        .json(utill.helpers.sendError("Aircraft not found"));
    }

    await db.dbs.AuditLogs.create({
      uuid: utill.uuid(),
      user_id: req.user.uuid,
      description: `Admin ${req.user.first_name} ${
        req.user.last_name
      } updated the status of aircraft with id ${cargo.uuid} from ${
        cargo.status
      } to ${status === "Deactivate" ? "Inactive" : "Activated"}
with note ${note}`,
    });

    let aircraftOwner = await db.dbs.Users.findOne({
      where: { uuid: cargo.owner_id },
    });

    if (status === "Deactivated") {
      cargo.status = "Inactive";
      await cargo.save();

      const option = {
        email: aircraftOwner.email,
        message:
          "Dear esteemed client, we regret to inform you that your aircraft is was not approved on our system, kindly go through the documents shared and make necessary updates as we will love to have you join us",
        name: aircraftOwner.first_name + " " + aircraftOwner.last_name,
      };

      try {
        utill.aircraftUpdate.sendMail(option);
      } catch (error) {
        console.log({ error });
      }
    } else {
      cargo.status = "Activated";
      await cargo.save();

      const option = {
        email: aircraftOwner.email,
        message:
          "Dear esteemed client, your aircraft documents have been reviewed and we are happy to inform you that your aircraft qualifies to be a part of our aircrafts. Thanks.",
        name: aircraftOwner.first_name + " " + aircraftOwner.last_name,
      };

      try {
        utill.aircraftUpdate.sendMail(option);
      } catch (error) {
        console.log({ error });
      }

      await db.dbs.AircraftAuditLog.create({
        uuid: utill.uuid(),
        user_id: req.user.uuid,
        flight_reg: cargo.flight_reg,
        activated_date: utill.moment().format("YYYY-MM-DD HH:mm:ss"),
        scheduled_date: utill
          .moment()
          .add(3, "months")
          .format("YYYY-MM-DD HH:mm:ss"),
      });
    }

    cargo.airworthiness_cert_checked = airworthiness_cert_status;
    cargo.noise_cert_checked = noise_cert_status;
    cargo.insurance_cert_checked = insurance_cert_status;
    cargo.registration_cert_checked = registration_cert_status;
    cargo.maintenance_program_checked = maintenance_program_status;
    cargo.mmel_checked = mmel_status;
    cargo.ops_manual_checked = ops_manual_status;
    cargo.note = note;
    cargo.aircraft_type_checked = aircraft_type_checked;
    cargo.payload_checked = payload_checked;
    cargo.ops_spec_checked = ops_spec_checked;
    cargo.flight_hrs_checked = flight_hrs_checked;
    cargo.aircraft_registration_checked = aircraft_registration_checked;
    cargo.airworthiness_cert_exp_checked = airworthiness_cert_exp_checked;
    cargo.noise_cert_exp_checked = noise_cert_exp_checked;
    cargo.insurance_cert_exp_checked = insurance_cert_exp_checked;
    cargo.registration_cert_exp_checked = registration_cert_exp_checked;
    cargo.noteOne = noteOne;
    cargo.driveLink = driveLink;
    cargo.noteTwo = noteTwo;
    await cargo.save();

    return res
      .status(200)
      .json(
        utill.helpers.sendSuccess(
          `Aircraft successfully ${status.toLowerCase()}`
        )
      );
  },

  allAircraftReports: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    // let reports = await db.dbs.AircraftAuditLog.findAll({});

    // return res.status(200).json({ reports });

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

    let reports = await db.dbs.AircraftAuditLog.findAndCountAll({
      offset: offset,
      limit: limit,
      order: [["id", "DESC"]],
    });

    var next_page = currentPage + 1;
    var prev_page = currentPage - 1;
    var nextP = `/api/jetwest/admin/all-aircraft-reports?pageNum=` + next_page;
    var prevP = `/api/jetwest/admin/all-aircraft-reports?pageNum=` + prev_page;

    const meta = paginate(currentPage, reports.count, reports.rows, pageSize);

    return res.status(200).json({
      status: "SUCCESS",
      data: reports,
      per_page: pageSize,
      current_page: currentPage,
      last_page: meta.pageCount, //transactions.count,
      first_page_url: `/api/jetwest/admin/all-aircraft-reports?pageNum=1`,
      last_page_url:
        `/api/jetwest/admin/all-aircraft-reports?pageNum=` + meta.pageCount, //transactions.count,
      next_page_url: nextP,
      prev_page_url: prevP,
      path: `/api/jetwest/admin/all-aircraft-reports?pageNum=`,
      from: 1,
      to: meta.pageCount, //transactions.count,
    });
  },

  singleAircraftReport: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    let uuid = req.query.uuid;

    if (!uuid) {
      return res
        .status(400)
        .json(utill.helpers.sendError("Kindly add a valid id"));
    }

    let report = await db.dbs.AircraftAuditLog.findOne({
      where: { uuid: uuid },
    });

    if (!report) {
      return res.status(400).json(utill.helpers.sendError("Report not found"));
    }

    return res.status(200).json({ report });
  },

  addAirAudit: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const loginSchema = utill.Joi.object()
      .keys({
        report_id: utill.Joi.string().allow(""),
        audit_report_url: utill.Joi.string().allow(""),
        observations: utill.Joi.string().allow(""),
      })
      .unknown();

    const validate = loginSchema.validate(req.body);

    if (validate.error != null) {
      const errorMessage = validate.error.details
        .map((i: any) => i.message)
        .join(".");
      return res.status(400).json(utill.helpers.sendError(errorMessage));
    }

    const { report_id, audit_report_url, observations } = req.body;

    let report = await db.dbs.AircraftAuditLog.findOne({
      where: { uuid: report_id },
    });

    report.report_url = audit_report_url;
    report.description = observations;
    await report.save();

    return res
      .status(200)
      .json(
        utill.helpers.sendSuccess("Successfully updated aircraft audit report")
      );
  },

  deleteAircraft: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    let { uuid } = req.query;

    let user = await db.dbs.Users.findOne({ where: { uuid: req.user.uuid } });

    if (parseInt(user.is_Admin) != 1) {
      return res
        .status(400)
        .json(
          utill.helpers.sendError(
            "Unauthorised access, Kindly contact system admin"
          )
        );
    }

    console.log("=======================");

    if (
      !(
        user.admin_type === "Flight Operator" ||
        user.admin_type === "Super Admin"
      )
    ) {
      return res
        .status(400)
        .json(utill.helpers.sendError("Access denied for current admin type"));
    }

    if (!uuid) {
      return res
        .status(400)
        .json(utill.helpers.sendError("Kindly add a valid aircraft ID"));
    }

    var cargos = await db.dbs.Cargo.findOne({
      where: { uuid: uuid },
    });

    await cargos.destroy();

    return res
      .status(200)
      .json(utill.helpers.sendSuccess("Aircraft successfully deleted"));
  },

  updateAdmin: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const loginSchema = utill.Joi.object()
      .keys({
        role_id: utill.Joi.string().allow(""),
        first_name: utill.Joi.string().allow(""),
        last_name: utill.Joi.string().allow(""),
        status: utill.Joi.string().allow(""),
        password: utill.Joi.string().allow(""),
        email: utill.Joi.string().required(),
      })
      .unknown();

    const validate = loginSchema.validate(req.body);

    if (validate.error != null) {
      const errorMessage = validate.error.details
        .map((i: any) => i.message)
        .join(".");
      return res.status(400).json(utill.helpers.sendError(errorMessage));
    }

    const { email, password, status, role_id, first_name, last_name } =
      req.body;

    let admin = await db.dbs.Users.findOne({
      where: { uuid: req.user.uuid },
    });

    if (parseInt(admin.is_Admin) != 1) {
      return res
        .status(400)
        .json(
          utill.helpers.sendError(
            "Unauthorised access, Kindly contact system admin"
          )
        );
    }

    if (admin.admin_type !== "Super Admin") {
      return res
        .status(400)
        .json(utill.helpers.sendError("Access denied for current admin user"));
    }

    let user = await db.dbs.Users.findOne({ where: { email: email } });

    if (!user) {
      return res.status(400).json(utill.helpers.sendError("Admin not found"));
    }

    if (password) {
      user.password = utill.bcrypt.hashSync(password);
      await user.save();
    }

    if (role_id) {
      let role = await db.dbs.Roles.findOne({ where: { uuid: role_id } });

      if (!role) {
        return res.status(400).json(utill.helpers.sendError("Role not found"));
      }

      console.log({ role: role.permissions });

      user.admin_type = role.name;
      user.roles = role.permissions;
      user.role_id = role_id;
      await user.save();
    }

    if (first_name && last_name) {
      user.first_name = first_name;
      user.last_name = last_name;
      await user.save();
    }
    if (status) {
      user.status = status;
      await user.save();
    }
    let option;

    if (role_id && password) {
      let role = await db.dbs.Roles.findOne({ where: { uuid: role_id } });
      option = {
        name: `${first_name} ${last_name}`,
        email: email,
        message: `Dear Admin, this is to inform you that your account has been updated with details first name ${first_name}, last name ${last_name}, password ${password}, role ${role.name}  and status ${status}`,
      };
    } else if (role_id && !password) {
      let role = await db.dbs.Roles.findOne({ where: { uuid: role_id } });
      option = {
        name: `${first_name} ${last_name}`,
        email: email,
        message: `Dear Admin, this is to inform you that your account has been updated with details first name ${first_name}, last name ${last_name}, , role ${role.name}  and status ${status}`,
      };
    } else if (!role_id && password) {
      option = {
        name: `${first_name} ${last_name}`,
        email: email,
        message: `Dear Admin, this is to inform you that your account has been updated with details first name ${first_name}, last name ${last_name}, password ${password}, and status ${status}`,
      };
    } else {
      option = {
        name: `${first_name} ${last_name}`,
        email: email,
        message: `Dear Admin, this is to inform you that your account has been updated with details first name ${first_name}, last name ${last_name}, and status ${status}`,
      };
    }

    utill.adminUpdate.sendMail(option);

    return res
      .status(200)
      .json(utill.helpers.sendSuccess("Admin data updated successfully"));
  },

  AgentAircrafts: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const { pageNum } = req.query;

    let user = await db.dbs.Users.findOne({ where: { uuid: req.user.uuid } });

    if (parseInt(user.is_Admin) != 1) {
      return res
        .status(400)
        .json(
          utill.helpers.sendError(
            "Unauthorised access, Kindly contact system admin"
          )
        );
    }

    if (
      !(
        user.admin_type === "Flight Operator" ||
        user.admin_type === "Super Admin"
      )
    ) {
      return res
        .status(400)
        .json(utill.helpers.sendError("Access denied for current admin type"));
    }

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

    // const transactions = await db.dbs.User.findAndCountAll({
    //   offset: offset,
    //   limit: limit,
    //   // where: { user_id: req.user.id },
    //   order: [["id", "DESC"]],
    // });

    var cargos = await db.dbs.Cargo.findAndCountAll({
      offset: offset,
      limit: limit,
      where: { owner_id: req.user.uuid },
      order: [["id", "DESC"]],
    });

    //1`;

    var next_page = currentPage + 1;
    var prev_page = currentPage - 1;
    var nextP = `/api/jetwest/admin/agent-cargos?pageNum=` + next_page;
    var prevP = `/api/jetwest/admin/agent-cargos?pageNum=` + prev_page;

    const meta = paginate(currentPage, cargos.count, cargos.rows, pageSize);

    return res.status(200).json({
      status: "SUCCESS",
      data: cargos,
      per_page: pageSize,
      current_page: currentPage,
      last_page: meta.pageCount, //transactions.count,
      first_page_url: `/api/jetwest/admin/agent-cargos?pageNum=1`,
      last_page_url:
        `/api/jetwest/admin/agent-cargos?pageNum=` + meta.pageCount, //transactions.count,
      next_page_url: nextP,
      prev_page_url: prevP,
      path: `/api/jetwest/admin/agent-cargos?pageNum=`,
      from: 1,
      to: meta.pageCount, //transactions.count,
    });
  },

  nonPaginatedRoles: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    let roles = await db.dbs.Roles.findAll();

    return res.status(200).json({ roles });
  },

  singleAircraft: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    let { uuid } = req.query;

    let user = await db.dbs.Users.findOne({ where: { uuid: req.user.uuid } });

    if (parseInt(user.is_Admin) != 1) {
      return res
        .status(400)
        .json(
          utill.helpers.sendError(
            "Unauthorised access, Kindly contact system admin"
          )
        );
    }

    if (
      !(
        user.admin_type === "Flight Operator" ||
        user.admin_type === "Super Admin"
      )
    ) {
      return res
        .status(400)
        .json(utill.helpers.sendError("Access denied for current admin type"));
    }

    if (!uuid) {
      return res
        .status(400)
        .json(utill.helpers.sendError("Kindly add a valid aircraft ID"));
    }

    var cargos = await db.dbs.Cargo.findOne({
      where: { uuid: uuid },
    });

    return res.status(200).json({ aircraft: cargos });
  },

  declinedAircrafts: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
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

    // const transactions = await db.dbs.User.findAndCountAll({
    //   offset: offset,
    //   limit: limit,
    //   // where: { user_id: req.user.id },
    //   order: [["id", "DESC"]],
    // });

    var cargos = await db.dbs.Cargo.findAndCountAll({
      offset: offset,
      limit: limit,
      where: { status: "Inactive" },
      order: [["id", "DESC"]],
    });

    //1`;

    var next_page = currentPage + 1;
    var prev_page = currentPage - 1;
    var nextP = `/api/jetwest/admin/declined-cargos?pageNum=` + next_page;
    var prevP = `/api/jetwest/admin/declined-cargos?pageNum=` + prev_page;

    const meta = paginate(currentPage, cargos.count, cargos.rows, pageSize);

    return res.status(200).json({
      status: "SUCCESS",
      data: cargos,
      per_page: pageSize,
      current_page: currentPage,
      last_page: meta.pageCount, //transactions.count,
      first_page_url: `/api/jetwest/admin/declined-cargos?pageNum=1`,
      last_page_url:
        `/api/jetwest/admin/declined-cargos?pageNum=` + meta.pageCount, //transactions.count,
      next_page_url: nextP,
      prev_page_url: prevP,
      path: `/api/jetwest/admin/declined-cargos?pageNum=`,
      from: 1,
      to: meta.pageCount, //transactions.count,
    });
  },

  activatedAircrafts: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
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

    // const transactions = await db.dbs.User.findAndCountAll({
    //   offset: offset,
    //   limit: limit,
    //   // where: { user_id: req.user.id },
    //   order: [["id", "DESC"]],
    // });

    var cargos = await db.dbs.Cargo.findAndCountAll({
      offset: offset,
      limit: limit,
      where: { status: "Active" },
      order: [["id", "DESC"]],
    });

    //1`;

    var next_page = currentPage + 1;
    var prev_page = currentPage - 1;
    var nextP = `/api/jetwest/admin/activated-cargos?pageNum=` + next_page;
    var prevP = `/api/jetwest/admin/activated-cargos?pageNum=` + prev_page;

    const meta = paginate(currentPage, cargos.count, cargos.rows, pageSize);

    return res.status(200).json({
      status: "SUCCESS",
      data: cargos,
      per_page: pageSize,
      current_page: currentPage,
      last_page: meta.pageCount, //transactions.count,
      first_page_url: `/api/jetwest/admin/activated-cargos?pageNum=1`,
      last_page_url:
        `/api/jetwest/admin/activated-cargos?pageNum=` + meta.pageCount, //transactions.count,
      next_page_url: nextP,
      prev_page_url: prevP,
      path: `/api/jetwest/admin/activated-cargos?pageNum=`,
      from: 1,
      to: meta.pageCount, //transactions.count,
    });
  },

  createReports: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const loginSchema = utill.Joi.object()
      .keys({
        flight_reg: utill.Joi.string().required(),
        activated_date: utill.Joi.string().required(),
        scheduled_date: utill.Joi.string().required(),
        upload_audit: utill.Joi.string().required(),
        observations: utill.Joi.string().required(),
      })
      .unknown();

    const validate = loginSchema.validate(req.body);

    if (validate.error != null) {
      const errorMessage = validate.error.details
        .map((i: any) => i.message)
        .join(".");
      return res.status(400).json(utill.helpers.sendError(errorMessage));
    }
    let user = await db.dbs.Users.findOne({ where: { uuid: req.user.uuid } });

    if (parseInt(user.is_Admin) != 1) {
      return res
        .status(400)
        .json(
          utill.helpers.sendError(
            "Unauthorised access, Kindly contact system admin"
          )
        );
    }

    if (
      user.admin_type !== "Flight Operator" ||
      user.admin_type !== "Super Admin"
    ) {
      return res
        .status(400)
        .json(utill.helpers.sendError("Access denied for current admin type"));
    }

    const {
      flight_reg,
      activated_date,
      scheduled_date,
      upload_audit,
      observations,
    } = req.body;

    let data = await db.dbs.ScheduleLogs.create({
      uuid: utill.uuid(),
      admin_id: req.user.uuid,
      flight_reg,
      activated_date,
      scheduled_date,
      upload_audit,
      description: observations,
      observations,
    });

    await db.dbs.AuditLogs.create({
      uuid: utill.uuid(),
      user_id: req.user.uuid,
      description: `Admin ${req.user.first_name} ${req.user.last_name} created a report with uuid ${data.uuid}
`,
    });

    return res
      .status(200)
      .json(utill.helpers.sendSuccess("Report created successfully"));
  },

  // compliance
  // shippers
  allShippers: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
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

    let shippers = await db.dbs.Users.findAndCountAll({
      offset: offset,
      limit: limit,
      where: { type: "Shipper" },
      order: [["id", "DESC"]],
    });

    var next_page = currentPage + 1;
    var prev_page = currentPage - 1;
    var nextP = `/api/jetwest/admin/all-shippers?pageNum=` + next_page;
    var prevP = `/api/jetwest/admin/all-shippers?pageNum=` + prev_page;

    const meta = paginate(currentPage, shippers.count, shippers.rows, pageSize);

    return res.status(200).json({
      status: "SUCCESS",
      data: shippers,
      per_page: pageSize,
      current_page: currentPage,
      last_page: meta.pageCount, //transactions.count,
      first_page_url: `/api/jetwest/admin/all-shippers?pageNum=1`,
      last_page_url:
        `/api/jetwest/admin/all-shippers?pageNum=` + meta.pageCount, //transactions.count,
      next_page_url: nextP,
      prev_page_url: prevP,
      path: `/api/jetwest/admin/all-shippers?pageNum=`,
      from: 1,
      to: meta.pageCount, //transactions.count,
    });
  },

  allActivatedShippers: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
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

    let activatedShippers = await db.dbs.Users.findAndCountAll({
      offset: offset,
      limit: limit,
      where: { type: "Shipper", verification_status: "completed" },
      order: [["id", "DESC"]],
    });

    var next_page = currentPage + 1;
    var prev_page = currentPage - 1;
    var nextP = `/api/jetwest/admin/activated-shippers?pageNum=` + next_page;
    var prevP = `/api/jetwest/admin/activated-shippers?pageNum=` + prev_page;

    const meta = paginate(
      currentPage,
      activatedShippers.count,
      activatedShippers.rows,
      pageSize
    );

    return res.status(200).json({
      status: "SUCCESS",
      data: activatedShippers,
      per_page: pageSize,
      current_page: currentPage,
      last_page: meta.pageCount, //transactions.count,
      first_page_url: `/api/jetwest/admin/activated-shippers?pageNum=1`,
      last_page_url:
        `/api/jetwest/admin/activated-shippers?pageNum=` + meta.pageCount, //transactions.count,
      next_page_url: nextP,
      prev_page_url: prevP,
      path: `/api/jetwest/admin/activated-shippers?pageNum=`,
      from: 1,
      to: meta.pageCount, //transactions.count,
    });
  },

  allDeclinedShippers: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
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

    let declinedShippers = await db.dbs.Users.findAndCountAll({
      offset: offset,
      limit: limit,
      where: { type: "Shipper", verification_status: "declined" },
      order: [["id", "DESC"]],
    });

    var next_page = currentPage + 1;
    var prev_page = currentPage - 1;
    var nextP = `/api/jetwest/admin/declined-shippers?pageNum=` + next_page;
    var prevP = `/api/jetwest/admin/declined-shippers?pageNum=` + prev_page;

    const meta = paginate(
      currentPage,
      declinedShippers.count,
      declinedShippers.rows,
      pageSize
    );

    return res.status(200).json({
      status: "SUCCESS",
      data: declinedShippers,
      per_page: pageSize,
      current_page: currentPage,
      last_page: meta.pageCount, //transactions.count,
      first_page_url: `/api/jetwest/admin/declined-shippers?pageNum=1`,
      last_page_url:
        `/api/jetwest/admin/declined-shippers?pageNum=` + meta.pageCount, //transactions.count,
      next_page_url: nextP,
      prev_page_url: prevP,
      path: `/api/jetwest/admin/declined-shippers?pageNum=`,
      from: 1,
      to: meta.pageCount, //transactions.count,
    });
  },

  // carriers

  allCarriers: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
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

    let carriers = await db.dbs.Users.findAndCountAll({
      offset: offset,
      limit: limit,
      where: { type: "Carrier" },
      order: [["id", "DESC"]],
    });

    var next_page = currentPage + 1;
    var prev_page = currentPage - 1;
    var nextP = `/api/jetwest/admin/all-carriers?pageNum=` + next_page;
    var prevP = `/api/jetwest/admin/all-carriers?pageNum=` + prev_page;

    const meta = paginate(currentPage, carriers.count, carriers.rows, pageSize);

    return res.status(200).json({
      status: "SUCCESS",
      data: carriers,
      per_page: pageSize,
      current_page: currentPage,
      last_page: meta.pageCount, //transactions.count,
      first_page_url: `/api/jetwest/admin/all-carriers?pageNum=1`,
      last_page_url:
        `/api/jetwest/admin/all-carriers?pageNum=` + meta.pageCount, //transactions.count,
      next_page_url: nextP,
      prev_page_url: prevP,
      path: `/api/jetwest/admin/all-carriers?pageNum=`,
      from: 1,
      to: meta.pageCount, //transactions.count,
    });
  },

  allActivatedCarriers: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
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

    let activatedCarriers = await db.dbs.Users.findAndCountAll({
      offset: offset,
      limit: limit,
      where: { type: "Carrier", verification_status: "completed" },
      order: [["id", "DESC"]],
    });

    var next_page = currentPage + 1;
    var prev_page = currentPage - 1;
    var nextP = `/api/jetwest/admin/activated-carriers?pageNum=` + next_page;
    var prevP = `/api/jetwest/admin/activated-carriers?pageNum=` + prev_page;

    const meta = paginate(
      currentPage,
      activatedCarriers.count,
      activatedCarriers.rows,
      pageSize
    );

    return res.status(200).json({
      status: "SUCCESS",
      data: activatedCarriers,
      per_page: pageSize,
      current_page: currentPage,
      last_page: meta.pageCount, //transactions.count,
      first_page_url: `/api/jetwest/admin/activated-carriers?pageNum=1`,
      last_page_url:
        `/api/jetwest/admin/activated-carriers?pageNum=` + meta.pageCount, //transactions.count,
      next_page_url: nextP,
      prev_page_url: prevP,
      path: `/api/jetwest/admin/activated-carriers?pageNum=`,
      from: 1,
      to: meta.pageCount, //transactions.count,
    });
  },

  allDeclinedCarriers: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
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

    let declinedCarriers = await db.dbs.Users.findAndCountAll({
      offset: offset,
      limit: limit,
      where: { type: "Carrier", verification_status: "declined" },
      order: [["id", "DESC"]],
    });

    var next_page = currentPage + 1;
    var prev_page = currentPage - 1;
    var nextP = `/api/jetwest/admin/declined-carriers?pageNum=` + next_page;
    var prevP = `/api/jetwest/admin/declined-carriers?pageNum=` + prev_page;

    const meta = paginate(
      currentPage,
      declinedCarriers.count,
      declinedCarriers.rows,
      pageSize
    );

    return res.status(200).json({
      status: "SUCCESS",
      data: declinedCarriers,
      per_page: pageSize,
      current_page: currentPage,
      last_page: meta.pageCount, //transactions.count,
      first_page_url: `/api/jetwest/admin/declined-carriers?pageNum=1`,
      last_page_url:
        `/api/jetwest/admin/declined-carriers?pageNum=` + meta.pageCount, //transactions.count,
      next_page_url: nextP,
      prev_page_url: prevP,
      path: `/api/jetwest/admin/declined-carriers?pageNum=`,
      from: 1,
      to: meta.pageCount, //transactions.count,
    });
  },

  // Agents
  allAgents: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
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

    let agents = await db.dbs.Users.findAndCountAll({
      offset: offset,
      limit: limit,
      where: { type: "Agent" },
      order: [["id", "DESC"]],
    });

    var next_page = currentPage + 1;
    var prev_page = currentPage - 1;
    var nextP = `/api/jetwest/admin/all-agents?pageNum=` + next_page;
    var prevP = `/api/jetwest/admin/all-agents?pageNum=` + prev_page;

    const meta = paginate(currentPage, agents.count, agents.rows, pageSize);

    return res.status(200).json({
      status: "SUCCESS",
      data: agents,
      per_page: pageSize,
      current_page: currentPage,
      last_page: meta.pageCount, //transactions.count,
      first_page_url: `/api/jetwest/admin/all-agents?pageNum=1`,
      last_page_url: `/api/jetwest/admin/all-agents?pageNum=` + meta.pageCount, //transactions.count,
      next_page_url: nextP,
      prev_page_url: prevP,
      path: `/api/jetwest/admin/all-agents?pageNum=`,
      from: 1,
      to: meta.pageCount, //transactions.count,
    });
  },

  allActivatedAgents: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
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

    let activatedAgents = await db.dbs.Users.findAndCountAll({
      offset: offset,
      limit: limit,
      where: { type: "Agent", verification_status: "completed" },
      order: [["id", "DESC"]],
    });

    var next_page = currentPage + 1;
    var prev_page = currentPage - 1;
    var nextP = `/api/jetwest/admin/activated-agents?pageNum=` + next_page;
    var prevP = `/api/jetwest/admin/activated-agents?pageNum=` + prev_page;

    const meta = paginate(
      currentPage,
      activatedAgents.count,
      activatedAgents.rows,
      pageSize
    );

    return res.status(200).json({
      status: "SUCCESS",
      data: activatedAgents,
      per_page: pageSize,
      current_page: currentPage,
      last_page: meta.pageCount, //transactions.count,
      first_page_url: `/api/jetwest/admin/activated-agents?pageNum=1`,
      last_page_url:
        `/api/jetwest/admin/activated-agents?pageNum=` + meta.pageCount, //transactions.count,
      next_page_url: nextP,
      prev_page_url: prevP,
      path: `/api/jetwest/admin/activated-agents?pageNum=`,
      from: 1,
      to: meta.pageCount, //transactions.count,
    });
  },

  allDeclinedAgents: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
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

    let declinedAgents = await db.dbs.Users.findAndCountAll({
      offset: offset,
      limit: limit,
      where: { type: "Agent", verification_status: "declined" },
      order: [["id", "DESC"]],
    });

    var next_page = currentPage + 1;
    var prev_page = currentPage - 1;
    var nextP = `/api/jetwest/admin/declined-agents?pageNum=` + next_page;
    var prevP = `/api/jetwest/admin/declined-agents?pageNum=` + prev_page;

    const meta = paginate(
      currentPage,
      declinedAgents.count,
      declinedAgents.rows,
      pageSize
    );

    return res.status(200).json({
      status: "SUCCESS",
      data: declinedAgents,
      per_page: pageSize,
      current_page: currentPage,
      last_page: meta.pageCount, //transactions.count,
      first_page_url: `/api/jetwest/admin/declined-agents?pageNum=1`,
      last_page_url:
        `/api/jetwest/admin/declined-agents?pageNum=` + meta.pageCount, //transactions.count,
      next_page_url: nextP,
      prev_page_url: prevP,
      path: `/api/jetwest/admin/declined-agents?pageNum=`,
      from: 1,
      to: meta.pageCount, //transactions.count,
    });
  },

  activateDeactivateUser: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const loginSchema = utill.Joi.object()
      .keys({
        user_id: utill.Joi.string().required(),
        state: utill.Joi.string().required(),
      })
      .unknown();

    const validate = loginSchema.validate(req.body);

    if (validate.error != null) {
      const errorMessage = validate.error.details
        .map((i: any) => i.message)
        .join(".");
      return res.status(400).json(utill.helpers.sendError(errorMessage));
    }

    const { user_id, state } = req.body;

    let user = await db.dbs.Users.findOne({ where: { uuid: user_id } });

    if (!user) {
      return res.status(400).json(utill.helpers.sendError("User not found"));
    }

    user.verification_status = state;
    await user.save();

    return res
      .status(200)
      .json(utill.helpers.sendSuccess("User status updated successfully"));
  },

  deleteUser: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    let uuid = req.query.uuid;
    if (!uuid) {
      return res
        .status(400)
        .json(utill.helpers.sendError("Kindly add a valid search parameter"));
    }

    let user = await db.dbs.Users.findOne({ where: { uuid: uuid } });

    if (!user) {
      return res.status(400).json(utill.helpers.sendError("User not found"));
    }

    await user.destroy();

    return res
      .status(200)
      .json(utill.helpers.sendSuccess("User successfully deleted"));
  },

  // logistics
  allShipments: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    // let status = await db.dbs.ShippingItems.findAll({})
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
    ``;

    let allShipments = await db.dbs.ShippingItems.findAndCountAll({
      offset: offset,
      limit: limit,
      order: [["id", "DESC"]],
    });

    var next_page = currentPage + 1;
    var prev_page = currentPage - 1;
    var nextP = `/api/jetwest/admin/all-shipments?pageNum=` + next_page;
    var prevP = `/api/jetwest/admin/all-shipments?pageNum=` + prev_page;

    const meta = paginate(
      currentPage,
      allShipments.count,
      allShipments.rows,
      pageSize
    );

    return res.status(200).json({
      status: "SUCCESS",
      data: allShipments,
      per_page: pageSize,
      current_page: currentPage,
      last_page: meta.pageCount, //transactions.count,
      first_page_url: `/api/jetwest/admin/all-shipments?pageNum=1`,
      last_page_url:
        `/api/jetwest/admin/all-shipments?pageNum=` + meta.pageCount, //transactions.count,
      next_page_url: nextP,
      prev_page_url: prevP,
      path: `/api/jetwest/admin/all-shipments?pageNum=`,
      from: 1,
      to: meta.pageCount, //transactions.count,
    });
  },

  singleShipment: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    let uuid = req.query.uuid;

    if (!uuid) {
      return res
        .status(400)
        .json(utill.helpers.sendError("Kindly add a valid search param"));
    }

    let shipment = await db.dbs.ShippingItems.findOne({
      where: { uuid: uuid },
    });

    if (!shipment) {
      return res
        .status(400)
        .json(utill.helpers.sendError("No shipment with this uuid found"));
    }

    return res.status(200).json({ shipment });
  },

  singleUser: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    let uuid = req.query.uuid;

    if (!uuid) {
      return res
        .status(400)
        .json(utill.helpers.sendError("Kindly add a valid search param"));
    }

    let user = await db.dbs.Users.findOne({ where: { uuid: uuid } });
    if (!user) {
      return res
        .status(400)
        .json(utill.helpers.sendError("No user with this email found"));
    }

    let business = await db.dbs.BusinessCompliance.findaAll({
      where: { user_id: user.uuid },
    });
    let director = await db.dbs.Directors.findAll({
      where: { user_id: user.uuid },
    });
    let cargos = await db.dbs.Cargo.findAll({ where: { owner_id: user.uuid } });
    let shipments = await db.dbs.ShippingItems.findAll({
      where: { user_id: user.uuid },
    });

    return res
      .status(200)
      .json({ user, business, director, cargos, shipments });
  },

  pendingShipments: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
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

    let pendingShipments = await db.dbs.ShippingItems.findAndCountAll({
      offset: offset,
      limit: limit,
      where: { status: "pending" },
      order: [["id", "DESC"]],
    });

    var next_page = currentPage + 1;
    var prev_page = currentPage - 1;
    var nextP = `/api/jetwest/admin/pending-shipments?pageNum=` + next_page;
    var prevP = `/api/jetwest/admin/pending-shipments?pageNum=` + prev_page;

    const meta = paginate(
      currentPage,
      pendingShipments.count,
      pendingShipments.rows,
      pageSize
    );

    return res.status(200).json({
      status: "SUCCESS",
      data: pendingShipments,
      per_page: pageSize,
      current_page: currentPage,
      last_page: meta.pageCount, //transactions.count,
      first_page_url: `/api/jetwest/admin/pending-shipments?pageNum=1`,
      last_page_url:
        `/api/jetwest/admin/pending-shipments?pageNum=` + meta.pageCount, //transactions.count,
      next_page_url: nextP,
      prev_page_url: prevP,
      path: `/api/jetwest/admin/pending-shipments?pageNum=`,
      from: 1,
      to: meta.pageCount, //transactions.count,
    });
  },

  enrouteShipments: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
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

    let enrouteShipments = await db.dbs.ShippingItems.findAndCountAll({
      offset: offset,
      limit: limit,
      where: { status: "enroute" },
      order: [["id", "DESC"]],
    });

    var next_page = currentPage + 1;
    var prev_page = currentPage - 1;
    var nextP = `/api/jetwest/admin/enroute-shipments?pageNum=` + next_page;
    var prevP = `/api/jetwest/admin/enroute-shipments?pageNum=` + prev_page;

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
      first_page_url: `/api/jetwest/admin/enroute-shipments?pageNum=1`,
      last_page_url:
        `/api/jetwest/admin/enroute-shipments?pageNum=` + meta.pageCount, //transactions.count,
      next_page_url: nextP,
      prev_page_url: prevP,
      path: `/api/jetwest/admin/enroute-shipments?pageNum=`,
      from: 1,
      to: meta.pageCount, //transactions.count,
    });
  },

  completedShipments: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
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

    let enrouteShipments = await db.dbs.ShippingItems.findAndCountAll({
      offset: offset,
      limit: limit,
      where: { status: "completed" },
      order: [["id", "DESC"]],
    });

    var next_page = currentPage + 1;
    var prev_page = currentPage - 1;
    var nextP = `/api/jetwest/admin/completed-shipments?pageNum=` + next_page;
    var prevP = `/api/jetwest/admin/completed-shipments?pageNum=` + prev_page;

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
      first_page_url: `/api/jetwest/admin/completed-shipments?pageNum=1`,
      last_page_url:
        `/api/jetwest/admin/completed-shipments?pageNum=` + meta.pageCount, //transactions.count,
      next_page_url: nextP,
      prev_page_url: prevP,
      path: `/api/jetwest/admin/completed-shipments?pageNum=`,
      from: 1,
      to: meta.pageCount, //transactions.count,
    });
  },

  // users

  allUsers: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
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

    let allUsers = await db.dbs.Users.findAndCountAll({
      offset: offset,
      limit: limit,
      order: [["id", "DESC"]],
      include: [
        {
          model: db.dbs.BusinessCompliance,
        },
        {
          model: db.dbs.Directors,
        },
      ],
    });

    var next_page = currentPage + 1;
    var prev_page = currentPage - 1;
    var nextP = `/api/jetwest/admin/all-users?pageNum=` + next_page;
    var prevP = `/api/jetwest/admin/all-users?pageNum=` + prev_page;

    const meta = paginate(currentPage, allUsers.count, allUsers.rows, pageSize);

    return res.status(200).json({
      status: "SUCCESS",
      data: allUsers,
      per_page: pageSize,
      current_page: currentPage,
      last_page: meta.pageCount, //transactions.count,
      first_page_url: `/api/jetwest/admin/all-users?pageNum=1`,
      last_page_url: `/api/jetwest/admin/all-users?pageNum=` + meta.pageCount, //transactions.count,
      next_page_url: nextP,
      prev_page_url: prevP,
      path: `/api/jetwest/admin/all-users?pageNum=`,
      from: 1,
      to: meta.pageCount, //transactions.count,
    });
  },
};
