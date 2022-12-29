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
      admin_type: roles.name,
      roles: roles.permissions,
    });

    const option = {
      name: `${req.user.first_name} ${req.user.last_name}`,
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
        departure_station: utill.Joi.string().required(),
        departure_date: utill.Joi.string().required(),
        destination_station: utill.Joi.string().required(),
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
      user.admin_type !== "Flight Operator" ||
      user.admin_type !== "Super Admin"
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

  createDestination: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const loginSchema = utill.Joi.object()
      .keys({
        country: utill.Joi.string().required(),
        destination_name: utill.Joi.string().required(),
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

    let data = await db.dbs.ShipmentRoutes.create({
      uuid: utill.uuid(),
      country,
      ratePerKg: 10,
      destination_name,
      code,
      route: name_of_airport,
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

    // const transactions = await db.dbs.User.findAndCountAll({
    //   offset: offset,
    //   limit: limit,
    //   // where: { user_id: req.user.id },
    //   order: [["id", "DESC"]],
    // });

    var admin = await db.dbs.Users.findAndCountAll({
      offset: offset,
      limit: limit,
      where: { is_admin: 1 },
      order: [["id", "DESC"]],
    });

    //1`;

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
    // let userList: any = [];
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

      utill.aircraftUpdate.sendMail(option);
    } else {
      cargo.status = "Activated";
      await cargo.save();

      const option = {
        email: aircraftOwner.email,
        message:
          "Dear esteemed client, your aircraft documents have been reviewed and we are happy to inform you that your aircraft qualifies to be a part of our aircrafts. Thanks.",
        name: aircraftOwner.first_name + " " + aircraftOwner.last_name,
      };

      utill.aircraftUpdate.sendMail(option);
    }

    cargo.airworthiness_cert_status = airworthiness_cert_status;
    cargo.noise_cert_status = noise_cert_status;
    cargo.insurance_cert_status = insurance_cert_status;
    cargo.registration_cert_status = registration_cert_status;
    cargo.maintenance_program_status = maintenance_program_status;
    cargo.mmel_status = mmel_status;
    cargo.ops_manual_status = ops_manual_status;
    cargo.note = note;
    cargo.aircraft_type_checked = aircraft_type_checked;
    // cargo.payload_checked = payload_checked;
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
};
