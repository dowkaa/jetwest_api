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
      role_id: roles.id,
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
      data: JSON.stringify(req.body),
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
    let permissions;

    let checker = utill.appCache.has("permissions");
    if (!checker) {
      permissions = await db.dbs.Permissions.findOne();
      utill.appCache.set("permissions", permissions);
    } else {
      permissions = utill.appCache.get("permissions");
    }

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
      data: JSON.stringify(req.body),
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
      data: JSON.stringify(req.body),
    });

    // Admin ${req.user.first_name} ${req.user.last_name} updated ${checker.first_name} ${checker.last_name}'s admin password

    return res
      .status(200)
      .json(
        utill.helpers.sendSuccess("Admin user's password updated successfully")
      );
  },

  //   scheduleFlights: async (
  //     req: any,
  //     res: Response,
  //     next: NextFunction
  //   ): Promise<Response> => {
  //     const loginSchema = utill.Joi.object()
  //       .keys({
  //         departure_station: utill.Joi.string().required(), // e.g name of state
  //         departure_date: utill.Joi.string().required(),
  //         destination_station: utill.Joi.string().required(), // e.g name of state
  //         flight_reg: utill.Joi.string().required(),
  //         arrival_date: utill.Joi.string().required(),
  //         scheduled_payload: utill.Joi.string().required(),
  //         stod_hour: utill.Joi.string().required(),
  //         stod_minute: utill.Joi.string().required(),
  //         stoa: utill.Joi.string().required(),
  //         duration: utill.Joi.string().required(),
  //       })
  //       .unknown();

  //     const validate = loginSchema.validate(req.body);

  //     if (validate.error != null) {
  //       const errorMessage = validate.error.details
  //         .map((i: any) => i.message)
  //         .join(".");
  //       return res.status(400).json(utill.helpers.sendError(errorMessage));
  //     }

  //     let user = await db.dbs.Users.findOne({ where: { uuid: req.user.uuid } });

  //     if (parseInt(user.is_Admin) != 1) {
  //       return res
  //         .status(400)
  //         .json(
  //           utill.helpers.sendError(
  //             "Unauthorised access, Kindly contact system admin"
  //           )
  //         );
  //     }

  //     if (
  //       !(
  //         user.admin_type === "Flight Operator" ||
  //         user.admin_type === "Super Admin"
  //       )
  //     ) {
  //       return res
  //         .status(400)
  //         .json(utill.helpers.sendError("Access denied for current admin type"));
  //     }

  //     let date = new Date();
  //     let yr = date.getFullYear();
  //     let month = date.getMonth();
  //     let mm;
  //     if (month === 0) {
  //       mm = "01";
  //     } else {
  //       mm = month;
  //     }
  //     let day = date.getDate();
  //     const {
  //       departure_station,
  //       flight_reg,
  //       stod_hour,
  //       stod_minute,
  //       stoa,
  //       duration,
  //       scheduled_payload,
  //       arrival_date,
  //       departure_date,
  //       destination_station,
  //     } = req.body;

  //     let aircraftChecker = await db.dbs.Cargo.findOne({
  //       where: { flight_reg: flight_reg },
  //     });

  //     if (!aircraftChecker) {
  //       return res
  //         .status(400)
  //         .json(
  //           utill.helpers.sendError(
  //             "Aircraft with provided flight registration id not found"
  //           )
  //         );
  //     }

  //     if (parseInt(aircraftChecker.payload) < parseInt(scheduled_payload)) {
  //       return res
  //         .status(400)
  //         .json(
  //           utill.helpers.sendError(
  //             "scheduled payload cannot be greater than aircraft capacity"
  //           )
  //         );
  //     }

  //     let data = await db.dbs.Destinations.findOne({
  //       where: { state: destination_station },
  //     });

  //     let takeOff = await db.dbs.Destinations.findOne({
  //       where: { state: departure_station },
  //     });

  //     if (!data) {
  //       return res
  //         .status(400)
  //         .json(utill.helpers.sendError("Destination does not exist"));
  //     }

  //     if (!takeOff) {
  //       return res
  //         .status(400)
  //         .json(utill.helpers.sendError("Departure does not exist"));
  //     }

  //     let total =
  //       departure_date.split("/").reverse().join("-") +
  //       " " +
  //       stod_hour +
  //       ":" +
  //       stod_minute +
  //       ":" +
  //       "00";

  //     let checker1 = await db.dbs.ScheduleFlights.findOne({
  //       where: {
  //         departure_station: departure_station,
  //         destination_station: destination_station,
  //         flight_reg,
  //         arrival_date: arrival_date.split("/").reverse().join("-"),
  //         departure_date: departure_date.split("/").reverse().join("-"),
  //         day: utill.moment().format("YYYY-MM-DD"),
  //         stod: total,
  //       },
  //     });

  //     if (checker1) {
  //       return res
  //         .status(400)
  //         .json(
  //           utill.helpers.sendError(
  //             "Flight with departure station, destination station and stod already exists, kindly add another stod with atleast more than one hour from the previous flight scheduled"
  //           )
  //         );
  //     }

  //     let checker2 = await db.dbs.ScheduleFlights.findOne({
  //       where: {
  //         departure_station: departure_station,
  //         flight_reg,
  //         arrival_date: arrival_date.split("/").reverse().join("-"),
  //         departure_date: departure_date.split("/").reverse().join("-"),
  //         destination_station: destination_station,
  //         day: utill.moment().format("YYYY-MM-DD"),
  //       },
  //       order: [["createdAt", "DESC"]],
  //     });

  //     if (checker2) {
  //       if (new Date(total).getTime() - Date.parse(checker2.stod) <= 719999) {
  //         return res
  //           .status(400)
  //           .json(
  //             utill.helpers.sendError(
  //               "Flight with departure station, destination station and stod already exists, kindly add another stod with atleast more than one hour from the previous flight scheduled"
  //             )
  //           );
  //       }
  //     }

  //     let carrier = await db.dbs.Users.findOne({
  //       where: { id: aircraftChecker.owner_id },
  //     });

  //     let dateString = departure_date.split("/").reverse().join("-");

  //     var d = new Date(dateString);
  //     var days = [
  //       "Sunday",
  //       "Monday",
  //       "Tuesday",
  //       "Wednesday",
  //       "Thursday",
  //       "Friday",
  //       "Saturday",
  //     ];
  //     var dayName = days[d.getDay()];

  //     await db.dbs.ScheduleFlights.create({
  //       uuid: utill.uuid(),
  //       user_id: req.user.id,
  //       departure_station,
  //       flight_reg,
  //       takeoff_airport: takeOff.name_of_airport,
  //       destination_airport: data.name_of_airport,
  //       stod: total,
  //       stoa,
  //       logo_url: carrier.profileDoc,
  //       status: "pending",
  //       day: utill.moment().format("YYYY-MM-DD"),
  //       duration,
  //       aircraft_owner: aircraftChecker.owner_id,
  //       scheduled_payload,
  //       available_capacity: parseFloat(scheduled_payload),
  //       arrival_date: arrival_date.split("/").reverse().join("-"),
  //       departure_date: departure_date.split("/").reverse().join("-"),
  //       departure_day: dayName,
  //       destination_station,
  //       groundHandler: data.groundHandler,
  //       email: data.email,
  //       phone_number: data.phone_number,
  //     });

  //     await db.dbs.AuditLogs.create({
  //       uuid: utill.uuid(),
  //       user_id: req.user.uuid,
  //       description: `Admin ${req.user.first_name} ${req.user.last_name} added a flight schedule
  // `,
  //       data: JSON.stringify(req.body),
  //     });

  //     return res
  //       .status(200)
  //       .json(
  //         utill.helpers.sendSuccess("You have successfully scheduled a flight")
  //       );
  //   },

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
        stod_hour: utill.Joi.string().required(),
        stod_minute: utill.Joi.string().required(),
        stoa: utill.Joi.string().required(),
        duration: utill.Joi.string().required(),
        type: utill.Joi.string().required(),
        dayNames: utill.Joi.array().allow(""),
        dayNums: utill.Joi.array().allow(""),
        end_date: utill.Joi.string().required(),
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

    let date = new Date();
    let yr = date.getFullYear();
    let month = date.getMonth();
    let mm;
    if (month === 0) {
      mm = "01";
    } else {
      mm = month;
    }
    let day = date.getDate();
    const {
      departure_station,
      flight_reg,
      stod_hour,
      stod_minute,
      stoa,
      duration,
      type,
      dayNames,
      dayNums,
      end_date,
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

    if (parseInt(aircraftChecker.payload) < parseInt(scheduled_payload)) {
      return res
        .status(400)
        .json(
          utill.helpers.sendError(
            "scheduled payload cannot be greater than aircraft capacity"
          )
        );
    }

    let data = await db.dbs.Destinations.findOne({
      where: { state: destination_station },
    });

    let takeOff = await db.dbs.Destinations.findOne({
      where: { state: departure_station },
    });

    if (!data) {
      return res
        .status(400)
        .json(utill.helpers.sendError("Destination does not exist"));
    }

    if (!takeOff) {
      return res
        .status(400)
        .json(utill.helpers.sendError("Departure does not exist"));
    }

    // let total =
    //   departure_date.split("/").reverse().join("-") +
    //   " " +
    //   stod_hour +
    //   ":" +
    //   stod_minute +
    //   ":" +
    //   "00";

    let starter = utill.moment(departure_date).format("YYYY-MM-DD");
    let later = utill.moment(end_date).format("YYYY-MM-DD");
    let now = utill.moment().format("YYYY-MM-DD");

    if (starter < now || later < now) {
      return res
        .status(400)
        .json(utill.helpers.sendError("Dates cannot be in the past"));
    }

    let total = stod_hour + ":" + stod_minute + ":" + "00";

    let carrier = await db.dbs.Users.findOne({
      where: {
        [Op.or]: {
          id: aircraftChecker.owner_id,
          uuid: aircraftChecker.owner_id,
        },
      },
    });

    if (!carrier) {
      return res.status(400).json(utill.helpers.sendError("Carrier not found"));
    }

    let dateString = departure_date.split("/").reverse().join("-");

    var d = new Date(dateString);
    var days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    var dayName = days[d.getDay()];

    let arr = [];
    if (
      !utill.moment(departure_date).isValid() ||
      !utill.moment(end_date).isValid()
    ) {
      return res
        .status(400)
        .json(
          utill.helpers.sendError(
            `Kindly parse a valid date in the format YYYY-MM-DD`
          )
        );
    }
    if (type === "daily") {
      let dayNamez = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      if (!(departure_date && end_date)) {
        return res
          .status(400)
          .json(
            utill.helpers.sendError(`departure date and end date are required`)
          );
      }
      let options = {
        startDate: utill.moment(departure_date).format("YYYY-MM-DD"),
        end_date: utill.moment(end_date).format("YYYY-MM-DD"),
        dayNames: dayNamez,
      };
      arr = await utill.helpers.getDatesOnDaysOfWeek(options);
    } else if (type === "bi-weekly") {
      if (!(departure_date && end_date && dayNames.length > 0)) {
        return res
          .status(400)
          .json(
            utill.helpers.sendError(
              `departure date, end date and names of days are required`
            )
          );
      }

      let options = {
        startDate: utill.moment(departure_date).format("YYYY-MM-DD"),
        end_date: utill.moment(end_date).format("YYYY-MM-DD"),
        dayNames,
      };
      arr = await utill.helpers.getDatesOnDaysOfWeek(options);
    } else if (type === "weekly") {
      if (!(departure_date && end_date && dayNames.length > 0)) {
        return res
          .status(400)
          .json(
            utill.helpers.sendError(
              `departure date, end date and names of days are required`
            )
          );
      }
      let options = {
        startDate: utill.moment(departure_date).format("YYYY-MM-DD"),
        end_date: utill.moment(end_date).format("YYYY-MM-DD"),
        dayNames,
      };
      arr = await utill.helpers.getDatesOnDaysOfWeek(options);
    } else if (type === "monthly") {
      if (!(departure_date && end_date && dayNums.length > 0)) {
        return res
          .status(400)
          .json(
            utill.helpers.sendError(
              `departure date, end date and dates of days are required`
            )
          );
      }
      let options = {
        startDate: utill.moment(departure_date).format("YYYY-MM-DD"),
        end_date: utill.moment(end_date).format("YYYY-MM-DD"),
        dayNums,
      };
      arr = await utill.helpers.getMonthlyDate(options);
    } else if (type === "yearly") {
      if (!(departure_date && end_date && dayNums.length > 0)) {
        return res
          .status(400)
          .json(
            utill.helpers.sendError(
              `departure date, end date and dates of days are required`
            )
          );
      }
      let options = {
        startDate: utill.moment(departure_date).format("YYYY-MM-DD"),
        end_date: utill.moment(end_date).format("YYYY-MM-DD"),
        dayNums,
      };
      arr = await utill.helpers.getYearlyDate(options);
    } else if (type === "once") {
      if (!departure_date) {
        return res
          .status(400)
          .json(utill.helpers.sendError(`departure date is required`));
      }
      arr = [utill.moment(departure_date).format("YYYY-MM-DD")];
    } else {
      return res
        .status(400)
        .json(
          utill.helpers.sendError(
            `Kindly add a valid schedule type: either once daily, weekly, bi-weekly, monthly or yearly. Thanks`
          )
        );
    }

    let checker1 = await db.dbs.ScheduleFlights.findOne({
      where: {
        departure_station: departure_station,
        destination_station: destination_station,
        flight_reg,
        arrival_date: arrival_date.split("/").reverse().join("-"),
        departure_date: JSON.stringify(arr),
        day: utill.moment().format("YYYY-MM-DD"),
        stod: total,
      },
    });

    if (checker1) {
      return res
        .status(400)
        .json(
          utill.helpers.sendError(
            "Flight with departure station, destination station and stod already exists, kindly add another stod with atleast more than one hour from the previous flight scheduled"
          )
        );
    }

    let checker2 = await db.dbs.ScheduleFlights.findOne({
      where: {
        departure_station: departure_station,
        flight_reg,
        arrival_date: arrival_date.split("/").reverse().join("-"),
        departure_date: JSON.stringify(arr),
        destination_station: destination_station,
        day: utill.moment().format("YYYY-MM-DD"),
      },
      order: [["createdAt", "DESC"]],
    });

    if (checker2) {
      if (new Date(total).getTime() - Date.parse(checker2.stod) <= 719999) {
        return res
          .status(400)
          .json(
            utill.helpers.sendError(
              "Flight with departure station, destination station and stod already exists, kindly add another stod with atleast more than one hour from the previous flight scheduled"
            )
          );
      }
    }

    await db.dbs.ScheduleFlights.create({
      uuid: utill.uuid(),
      user_id: req.user.id,
      departure_station,
      flight_reg,
      aircraft_id: aircraftChecker.id,
      takeoff_airport: takeOff.name_of_airport,
      destination_airport: data.name_of_airport,
      stod: total,
      stoa,
      logo_url: carrier.profileDoc,
      status: "pending",
      day: utill.moment().format("YYYY-MM-DD"),
      duration,
      aircraft_owner: aircraftChecker.owner_id,
      scheduled_payload,
      available_capacity: parseFloat(scheduled_payload),
      arrival_date: arrival_date.split("/").reverse().join("-"),
      departure_date: JSON.stringify(arr),
      all_schedules: JSON.stringify(arr),
      departure_day: dayName,
      destination_station,
      groundHandler: data.groundHandler,
      schedule_type: type,
      email: data.email,
      phone_number: data.phone_number,
    });

    await db.dbs.AuditLogs.create({
      uuid: utill.uuid(),
      user_id: req.user.uuid,
      description: `Admin ${req.user.first_name} ${req.user.last_name} added a flight schedule
`,
      data: JSON.stringify(req.body),
    });
    utill.appCache.flushAll();

    return res
      .status(200)
      .json(
        utill.helpers.sendSuccess("You have successfully scheduled a flight")
      );
  },

  deleteScheduledFlight: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    let uuid = req.query.uuid;

    if (!uuid) {
      return res
        .status(400)
        .json(utill.helpers.sendError("Kindly add a valid uuid"));
    }

    let checker = await db.dbs.ScheduleFlights.findOne({
      where: { uuid: uuid },
    });

    if (!checker) {
      return res
        .status(400)
        .json(utill.helpers.sendError("flight with uuid not found"));
    }

    await checker.destroy();

    await db.dbs.AuditLogs.create({
      uuid: utill.uuid(),
      user_id: req.user.uuid,
      description: `Admin ${req.user.first_name} ${
        req.user.last_name
      } deleted a flight scheduled for arrival date of ${
        checker.arrival_date
      } with data ${JSON.stringify(checker)}
`,
      data: JSON.stringify(checker),
    });
    utill.appCache.flushAll();

    return res
      .status(200)
      .json(
        utill.helpers.sendSuccess(
          "You have successfully updated a scheduled flight"
        )
      );
  },

  updateScheduledFlight: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const loginSchema = utill.Joi.object()
      .keys({
        flight_id: utill.Joi.string().required(),
        departure_station: utill.Joi.string().required(), // e.g name of state
        departure_date: utill.Joi.string().required(),
        destination_station: utill.Joi.string().required(), // e.g name of state
        flight_reg: utill.Joi.string().required(),
        arrival_date: utill.Joi.string().required(),
        scheduled_payload: utill.Joi.string().required(),
        stod_hour: utill.Joi.string().required(),
        stod_minute: utill.Joi.string().required(),
        stoa: utill.Joi.string().required(),
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

    const {
      flight_id,
      departure_station,
      departure_date,
      destination_station,
      flight_reg,
      arrival_date,
      scheduled_payload,
      stod_hour,
      stod_minute,
      stoa,
      duration,
    } = req.body;

    let checker = await db.dbs.ScheduleFlights.findOne({
      where: { uuid: flight_id },
    });

    if (!checker) {
      return res
        .status(400)
        .json(utill.helpers.sendError("flight with uuid not found"));
    }

    if (checker.status !== "pending") {
      return res
        .status(400)
        .json(
          utill.helpers.sendError(
            "flight cannot be updated as current flight is in progress"
          )
        );
    }

    let date = new Date();
    let yr = date.getFullYear();
    let month = date.getMonth();
    let mm;
    if (month === 0) {
      mm = "01";
    } else {
      mm = month;
    }
    let day = date.getDate();

    let total =
      yr +
      "-" +
      mm +
      "-" +
      day +
      " " +
      stod_hour +
      ":" +
      stod_minute +
      ":" +
      "00";

    checker.departure_station = departure_station;
    checker.flight_reg = flight_reg;
    checker.stod = total;
    checker.stoa = stoa;
    checker.duration = duration;
    checker.scheduled_payload = scheduled_payload;
    checker.available_capacity = parseFloat(scheduled_payload);
    checker.arrival_date = arrival_date;
    checker.departure_date = departure_date;
    checker.destination_station = destination_station;
    await checker.save();

    await db.dbs.AuditLogs.create({
      uuid: utill.uuid(),
      user_id: req.user.uuid,
      description: `Admin ${req.user.first_name} ${
        req.user.last_name
      } updated a flight scheduled for arrival date of ${arrival_date} with data ${JSON.stringify(
        req.body
      )}
`,
      data: JSON.stringify(req.body),
    });

    return res
      .status(200)
      .json(
        utill.helpers.sendSuccess(
          "You have successfully updated a scheduled flight"
        )
      );
  },

  routeEstimate: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const loginSchema = utill.Joi.object()
      .keys({
        route_id: utill.Joi.string().required(),
        ratePerKg: utill.Joi.number().required(),
        daily_exchange_rate: utill.Joi.number().required(),
        tax: utill.Joi.number().required(),
        insurance: utill.Joi.number().required(),
        sur_charge: utill.Joi.number().required(),
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
      route_id,
      ratePerKg,
      daily_exchange_rate,
      tax,
      insurance,
      sur_charge,
    } = req.body;

    let route = await db.dbs.ShipmentRoutes.findOne({
      where: { uuid: route_id },
    });

    if (!route) {
      return res.status(400).json(utill.helpers.sendError("route not found"));
    }

    route.ratePerKg = ratePerKg;
    route.sur_charge = sur_charge;
    route.tax = tax;
    route.dailyExchangeRate = daily_exchange_rate;
    route.insurance = insurance;

    await db.dbs.AuditLogs.create({
      uuid: utill.uuid(),
      user_id: req.user.uuid,
      description: `Admin ${req.user.first_name} ${
        req.user.last_name
      } updated route with uuid ${route_id} with payload ${JSON.stringify(
        req.body
      )}`,
      data: JSON.stringify(req.body),
    });

    return res
      .status(200)
      .json(utill.helpers.sendSuccess("Route successfully updated"));
  },

  unpaginatedAircrafts: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    let checker = utill.appCache.has("unpaginated-cargos");
    let aircrafts;
    if (checker) {
      aircrafts = utill.appCache.get("unpaginated-cargos");
    } else {
      aircrafts = await db.dbs.Cargo.findAll({
        where: { status: "Activated" },
      });
      utill.appCache.set("unpaginated-cargos", aircrafts);
    }

    return res.status(200).json({ aircrafts });
  },

  allScheduledFlights: async (
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

    let allFlights;
    let checker = utill.appCache.has("all-flights-pageNum=" + pageNum);
    if (checker) {
      allFlights = utill.appCache.get("all-flights-pageNum=" + pageNum);
    } else {
      allFlights = await db.dbs.ScheduleFlights.findAndCountAll({
        offset: offset,
        limit: limit,
        order: [["id", "DESC"]],
      });
      utill.appCache.set("all-flights-pageNum=" + pageNum, allFlights);
    }

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

    let flights;
    let checker = utill.appCache.has("Flights-in-progress-pageNum=" + pageNum);

    if (checker) {
      flights = utill.appCache.get("Flights-in-progress-pageNum=" + pageNum);
    } else {
      flights = await db.dbs.ScheduleFlights.findAndCountAll({
        offset: offset,
        limit: limit,
        where: { status: "In progress" },
        order: [["id", "DESC"]],
      });
      if (flights.rows.length > 0) {
        utill.appCache.set("Flights-in-progress-pageNum=" + pageNum, flights);
      }
    }

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

    let flights;
    let checker = utill.appCache.has("completed-flights-pageNum=" + pageNum);

    if (checker) {
      flights = utill.appCache.get("completed-flights-pageNum=" + pageNum);
    } else {
      flights = await db.dbs.ScheduleFlights.findAndCountAll({
        offset: offset,
        limit: limit,
        where: { status: "completed" },
        order: [["id", "DESC"]],
      });
      if (flights.rows.length > 0) {
        utill.appCache.set("completed-flights-pageNum=" + pageNum, flights);
      }
    }

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

  pendingFlights: async (
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

    let checker = utill.appCache.has("all-pending-flights-pageNum=" + pageNum);
    let flights;
    if (checker) {
      flights = utill.appCache.get("all-pending-flights-pageNum=" + pageNum);
    } else {
      flights = await db.dbs.ScheduleFlights.findAndCountAll({
        offset: offset,
        limit: limit,
        where: { status: "pending" },
        order: [["id", "DESC"]],
      });
      utill.appCache.set("all-pending-flights-pageNum=" + pageNum, flights);
    }

    var next_page = currentPage + 1;
    var prev_page = currentPage - 1;
    var nextP = `/api/jetwest/admin/pending-flights?pageNum=` + next_page;
    var prevP = `/api/jetwest/admin/pending-flights?pageNum=` + prev_page;

    const meta = paginate(currentPage, flights.count, flights.rows, pageSize);

    return res.status(200).json({
      status: "SUCCESS",
      data: flights,
      per_page: pageSize,
      current_page: currentPage,
      last_page: meta.pageCount, //transactions.count,
      first_page_url: `/api/jetwest/admin/pending-flights?pageNum=1`,
      last_page_url:
        `/api/jetwest/admin/pending-flights?pageNum=` + meta.pageCount, //transactions.count,
      next_page_url: nextP,
      prev_page_url: prevP,
      path: `/api/jetwest/admin/pending-flights?pageNum=`,
      from: 1,
      to: meta.pageCount, //transactions.count,
    });
  },

  updateATD: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const loginSchema = utill.Joi.object()
      .keys({
        flight_id: utill.Joi.string().required(),
        atd: utill.Joi.string().required(),
      })
      .unknown();

    const validate = loginSchema.validate(req.body);

    if (validate.error != null) {
      const errorMessage = validate.error.details
        .map((i: any) => i.message)
        .join(".");
      return res.status(400).json(utill.helpers.sendError(errorMessage));
    }

    const { flight_id, atd } = req.body;

    let flight = await db.dbs.ScheduleFlights.findOne({
      where: { uuid: flight_id },
    });

    if (!flight) {
      return res.status(400).json(utill.helpers.sendError("Flight not found"));
    }

    if (flight.status !== "In progress") {
      return res.status(400).json(utill.helpers.sendError("Not allowed"));
    }

    flight.atd = atd;
    flight.status = "Almost completed";
    await flight.save();

    utill.helpers.updateShipment(flight);

    return res
      .status(200)
      .json(utill.helpers.sendSuccess("Flight ATD updated successfully"));
  },

  updateBlockTime: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const loginSchema = utill.Joi.object()
      .keys({
        flight_id: utill.Joi.string().required(),
        block_time: utill.Joi.string().required(),
        tat: utill.Joi.string().required(),
      })
      .unknown();

    const validate = loginSchema.validate(req.body);

    if (validate.error != null) {
      const errorMessage = validate.error.details
        .map((i: any) => i.message)
        .join(".");
      return res.status(400).json(utill.helpers.sendError(errorMessage));
    }

    const { flight_id, block_time, tat } = req.body;

    let flight = await db.dbs.ScheduleFlights.findOne({
      where: { uuid: flight_id },
    });

    if (!flight) {
      return res.status(400).json(utill.helpers.sendError("Flight not found"));
    }

    if (flight.status !== "Almost completed") {
      return res.status(400).json(utill.helpers.sendError("Not allowed"));
    }

    flight.block_time = block_time;
    flight.tat = tat;
    flight.status = "completed";
    await flight.save();

    let shipment = await db.dbs.ShippingItems.findOne({
      where: { flight_id: flight.id },
    });

    if (shipment) {
      let route = await db.dbs.ShipmentRoutes.findOne({
        where: {
          destination_name: shipment.destination,
          type: shipment.shipment_model,
        },
      });
      let user = await db.dbs.Users.findOne({
        where: { id: shipment.user_id },
      });
      const option = {
        shipment_ref: shipment.booking_reference,
        name: shipment.shipperName,
        email: user.email,
        destination_airport: route.destination_airport,
      };

      const option2 = {
        shipment_ref: shipment.booking_reference,
        name: shipment.reciever_firstname + " " + shipment.reciever_lastname,
        email: shipment.reciever_email,
        destination_airport: route.destination_airport,
      };

      utill.shipmentArrival.sendMail(option);
      utill.shipmentArrival.sendMail(option2);
    }

    return res
      .status(200)
      .json(utill.helpers.sendSuccess("Flight successfully completed"));
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
    let checker = utill.appCache.has("single-flight" + uuid);
    let flights;
    if (!checker) {
      flights = await db.dbs.ScheduleFlights.findOne({
        where: { uuid: uuid },
      });
      utill.appCache.set("single-flight" + uuid, flights);
    } else {
      flights = utill.appCache.get("single-flight" + uuid);
    }
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

    let checker = await db.dbs.Destinations.findOne({
      where: { state: destination_name, name_of_airport: name_of_airport },
    });

    if (checker) {
      return res
        .status(400)
        .json(
          utill.helpers.sendError(
            `Destination with state ${destination_name} and airport ${name_of_airport} already created`
          )
        );
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
      data: JSON.stringify(req.body),
    });
    utill.appCache.flushAll();

    return res
      .status(200)
      .json(
        utill.helpers.sendSuccess("You have successfully added a destination")
      );
  },

  allDestinations: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    let checker = utill.appCache.has("all-unpaginated-destinations");
    let destinations;
    if (checker) {
      destinations = utill.appCache.get("all-unpaginated-destinations");
    } else {
      destinations = await db.dbs.Destinations.findAll();
      utill.appCache.set("all-unpaginated-destinations", destinations);
    }
    return res.status(200).json({ destinations });
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

    let checker = utill.appCache.has(
      "all-destinations-count-pageNum=" + pageNum
    );
    let destinations;

    if (checker) {
      destinations = utill.appCache.get(
        "all-destinations-count-pageNum=" + pageNum
      );
    } else {
      destinations = await db.dbs.Destinations.findAndCountAll({
        offset: offset,
        limit: limit,
        order: [["id", "DESC"]],
      });
      utill.appCache.set(
        "all-destinations-count-pageNum=" + pageNum,
        destinations
      );
    }
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
        agent_rate: utill.Joi.number().allow(""),
        type: utill.Joi.string().required(),
        value: utill.Joi.number().required(),
        air_wayBill_rate: utill.Joi.number().required(),
        tax: utill.Joi.number().required(),
        insurance: utill.Joi.number().required(),
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
      agent_rate,
      type,
      air_wayBill_rate,
      tax,
      insurance,
      surcharge,
    } = req.body;

    if (type === "direct" && !agent_rate) {
      return res
        .status(400)
        .json(
          utill.helpers.sendError("Agent rates is required for this route type")
        );
    }

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
      where: {
        departure: departure,
        destination_name: destination,
        type: type,
      },
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
      agent_rate: agent_rate,
      type,
      air_wayBill_rate: air_wayBill_rate,
      value,
      insurance,
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
      data: JSON.stringify(req.body),
    });

    const option = {
      name: `${req.user.first_name} ${req.user.last_name}`,
      email: req.user.email,
      message: "This is to inform you that you have been assigned to ",
    };
    utill.appCache.flushAll();

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
        tax: utill.Joi.number().required(),
        agent_rate: utill.Joi.number().allow(""),
        type: utill.Joi.string().required(),
        air_WayBill: utill.Joi.number().required(),
        insurance: utill.Joi.number().required(),
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
      route_id,
      dollarPerKg,
      dailyExchangeRate,
      value,
      tax,
      agent_rate,
      air_WayBill,
      type,
      insurance,
      surcharge,
    } = req.body;

    let route = await db.dbs.ShipmentRoutes.findOne({
      where: { uuid: route_id },
    });

    if (!route) {
      return res.status(400).json(utill.helpers.sendError("Route not found"));
    }

    if (agent_rate) {
      route.agent_rate = parseFloat(agent_rate);
    }
    // await db.dbs.ShipmentRoutes.create({
    route.route = departure + " to " + destination;
    route.ratePerKg = parseFloat(dollarPerKg);
    route.type = type;
    route.air_wayBill_rate = parseFloat(air_WayBill);
    route.sur_charge = surcharge;
    route.tax = tax;
    route.departure = departure;
    route.dailyExchangeRate = dailyExchangeRate;
    route.value = parseFloat(dollarPerKg) * parseFloat(dailyExchangeRate);
    route.insurance = insurance;
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
      data: JSON.stringify(req.body),
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
      data: JSON.stringify(route),
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

    let checker = utill.appCache.has("single-route" + uuid);
    let route;
    if (checker) {
      route = utill.appCache.get("single-route" + uuid);
    } else {
      route = await db.dbs.ShipmentRoutes.findOne({ where: { uuid: uuid } });
      utill.appCache.set("single-route" + uuid, route);
    }

    if (!route) {
      return res.status(400).json(utill.helpers.sendError("Route not found"));
    }

    return res.status(200).json({ route });
  },

  addUserNote: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const loginSchema = utill.Joi.object()
      .keys({
        user_id: utill.Joi.string().required(),
        directors_note: utill.Joi.string().required(),
        director_id: utill.Joi.string().required(),
        business_compliance_note: utill.Joi.string().required(),
        getStarted_note: utill.Joi.string().required(),
        about_note: utill.Joi.string().required(),
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
      user_id,
      about_note,
      directors_note,
      director_id,
      business_compliance_note,
      getStarted_note,
    } = req.body;

    let user = await db.dbs.Users.findOne({ where: { uuid: user_id } });

    if (!user) {
      return res.status(400).json(utill.helpers.sendError("User not found"));
    }

    let business = await db.dbs.BusinessCompliance.findOne({
      where: { user_id: { [Op.or]: [user.uuid, user.id] } },
    });

    if (business) {
      business.notes = business_compliance_note;
      business.getStarted = getStarted_note;
      await business.save();
    }
    let director = await db.dbs.Directors.findOne({
      where: { uuid: director_id },
    });

    if (director) {
      director.notes = directors_note;
      await director.save();
    }

    user.notes = about_note;
    await user.save();
    utill.appCache.flushAll();

    return res
      .status(200)
      .json(utill.helpers.sendSuccess("User updated successfully"));
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

    let checker = utill.appCache.has("all-routes-pageNum=" + pageNum);
    var routes;
    if (checker) {
      routes = utill.appCache.get("all-routes-pageNum=" + pageNum);
    } else {
      routes = await db.dbs.ShipmentRoutes.findAndCountAll({
        offset: offset,
        limit: limit,
        order: [["id", "DESC"]],
      });
      utill.appCache.set("all-routes-pageNum=" + pageNum, routes);
    }

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

    await db.dbs.AuditLogs.create({
      uuid: utill.uuid(),
      user_id: req.user.uuid,
      description: `Admin ${req.user.first_name} ${req.user.last_name} created a role with name ${name}`,
      data: JSON.stringify(req.body),
    });
    utill.appCache.flushAll();

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

    let checker = utill.appCache.has("all_admins-pageNum=" + pageNum);
    let admin;

    if (checker) {
      admin = utill.appCache.get("all_admins-pageNum=" + pageNum);
    } else {
      admin = admin = await db.dbs.Users.findAndCountAll({
        offset: offset,
        limit: limit,
        where: { is_admin: 1 },
        order: [["id", "DESC"]],
      });
      if (admin.rows.length > 0) {
        utill.appCache.set("all_admins-pageNum=" + pageNum, admin);
      }
    }

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

    if (parseInt(req.user.is_Admin) != 1) {
      return res
        .status(400)
        .json(
          utill.helpers.sendError(
            "Unauthorised access, Kindly contact system admin"
          )
        );
    }

    if (!(req.user.admin_type === "Super Admin")) {
      return res
        .status(400)
        .json(utill.helpers.sendError("Access denied for current admin type"));
    }

    let checker = utill.appCache.has("all_roles-pageNum=" + pageNum);
    let roles;

    if (checker) {
      roles = utill.appCache.get("all_roles-pageNum=" + pageNum);
    } else {
      roles = await db.dbs.Roles.findAndCountAll({
        offset: offset,
        limit: limit,
        order: [["id", "DESC"]],
      });
      if (roles.rows.length > 0) {
        utill.appCache.set("all_roles-pageNum=" + pageNum, roles);
      }
    }
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

    if (parseInt(req.user.is_Admin) != 1) {
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
        req.user.admin_type === "Flight Operator" ||
        req.user.admin_type === "Super Admin"
      )
    ) {
      return res
        .status(400)
        .json(utill.helpers.sendError("Access denied for current admin type"));
    }

    let checker = utill.appCache.has("all_cargos-pageNum=" + pageNum);
    let cargos;

    if (checker) {
      cargos = utill.appCache.get("all_cargos-pageNum=" + pageNum);
    } else {
      cargos = await db.dbs.Cargo.findAndCountAll({
        offset: offset,
        limit: limit,
        order: [["id", "DESC"]],
      });
      if (cargos.rows.length > 0) {
        utill.appCache.set("all_cargos-pageNum=" + pageNum, cargos);
        console.log("22222222222222222222222222");
      }
    }

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
      where: { id: cargo.owner_id },
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
    utill.appCache.flushAll();

    return res
      .status(200)
      .json(
        utill.helpers.sendSuccess(
          `Aircraft successfully ${status.toLowerCase()}`
        )
      );
  },

  updateRate: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const loginSchema = utill.Joi.object()
      .keys({
        value: utill.Joi.number().required(),
      })
      .unknown();

    const validate = loginSchema.validate(req.body);

    if (validate.error != null) {
      const errorMessage = validate.error.details
        .map((i: any) => i.message)
        .join(".");
      return res.status(400).json(utill.helpers.sendError(errorMessage));
    }
    const { value } = req.body;

    let user = await db.dbs.Users.findOne({ where: { uuid: req.user.uuid } });

    if (user.isAdmin !== 1) {
      return res
        .status(400)
        .json(utill.helpers.sendError("Access denied for non admin users"));
    }

    if (user.admin_type !== "Super Admin") {
      return res.status(400).json(utill.helpers.sendError("UNAUTHORISED!!!!!"));
    }

    let rate = await db.dbs.Rates.findOne();

    if (!rate) {
      await db.dbs.Rates.create({
        uuid: utill.uuid(),
        value: value,
      });

      return res
        .status(200)
        .json(
          utill.helpers.sendSuccess(
            `Successfully created naira-dollar exchange rate`
          )
        );
    }

    rate.value = value;
    await rate.save();

    await db.dbs.AuditLogs.create({
      uuid: utill.uuid(),
      user_id: req.user.uuid,
      description: `Admin ${req.user.first_name} ${req.user.last_name} updated the naira-dollar exchange rate to from ${rate.value} to  ${value}`,
      data: JSON.stringify(req.body),
    });

    return res
      .status(200)
      .json(
        utill.helpers.sendSuccess(
          `Successfully updated naira-dollar exchange rate`
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

    let checker = utill.appCache.has("aircraft-reports-pageNum=" + pageNum);
    let reports;
    if (checker) {
      reports = utill.appCache.get("aircraft-reports-pageNum=" + pageNum);
    } else {
      reports = await db.dbs.AircraftAuditLog.findAndCountAll({
        offset: offset,
        limit: limit,
        order: [["id", "DESC"]],
      });
      if (reports.rows.length > 0) {
        utill.appCache.set("aircraft-reports-pageNum=" + pageNum, reports);
      }
    }

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

    let report;
    let checker = utill.appCache.has("single-aircraft-report" + uuid);

    if (checker) {
      report = utill.appCache.get("single-aircraft-report" + uuid);
    } else {
      report = await db.dbs.AircraftAuditLog.findOne({
        where: { uuid: uuid },
      });
      utill.appCache.set("single-aircraft-report" + uuid, report);
    }
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

    if (!report) {
      return res
        .status(400)
        .json(utill.helpers.sendError("Aircraft report with id not found"));
    }

    report.report_url = audit_report_url;
    report.description = observations;
    await report.save();

    await db.dbs.AuditLogs.create({
      uuid: utill.uuid(),
      user_id: req.user.uuid,
      description: `Admin ${req.user.first_name} ${req.user.last_name} added the air audit for air audit with id ${report.uuid}`,
      data: JSON.stringify(req.body),
    });

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

    if (parseInt(req.user.is_Admin) != 1) {
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
        req.user.admin_type === "Flight Operator" ||
        req.user.admin_type === "Super Admin"
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

    if (parseInt(req.user.is_Admin) != 1) {
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
        req.user.admin_type === "Flight Operator" ||
        req.user.admin_type === "Super Admin"
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

    let cargosCount = utill.appCache.has(
      "cargosCount-pageNum=" + pageNum + req.user.uuid
    );
    var cargos;

    if (cargosCount) {
      cargos = utill.appCache.get(
        "cargosCount-pageNum=" + pageNum + req.user.uuid
      );
    } else {
      cargos = await db.dbs.Cargo.findAndCountAll({
        offset: offset,
        limit: limit,
        where: { owner_id: req.user.uuid },
        order: [["id", "DESC"]],
      });
      if (cargos.rows.length > 0) {
        utill.appCache.set(
          "cargosCount-pageNum=" + pageNum + req.user.uuid,
          cargos
        );
      }
    }

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
    let checker = utill.appCache.has("non-paiginated-roles");
    let roles;

    if (checker) {
      roles = utill.appCache.get("non-paiginated-roles");
    } else {
      roles = await db.dbs.Roles.findAll();
      utill.appCache.set("non-paiginated-roles", roles);
    }

    return res.status(200).json({ roles });
  },

  singleAircraft: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    let { uuid } = req.query;

    if (parseInt(req.user.is_Admin) != 1) {
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
        req.user.admin_type === "Flight Operator" ||
        req.user.admin_type === "Super Admin"
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

    let checker = utill.appCache.has("cargos" + uuid);
    let cargos;

    if (checker) {
      cargos = utill.appCache.get("cargos" + uuid);
    } else {
      cargos = await db.dbs.Cargo.findOne({
        where: { uuid: uuid },
      });
      utill.appCache.set("cargos" + uuid, cargos);
      console.log("22222222222222222222222222");
    }

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
    let cargosCount = utill.appCache.has(
      "declined-cargosCount-pageNum=" + pageNum
    );
    var cargos;

    if (cargosCount) {
      cargos = utill.appCache.get("declined-cargosCount-pageNum=" + pageNum);
    } else {
      cargos = await db.dbs.Cargo.findAndCountAll({
        offset: offset,
        limit: limit,
        where: { status: "Inactive" },
        order: [["id", "DESC"]],
      });
      if (cargos.rows.length > 0) {
        utill.appCache.set("declined-cargosCount-pageNum=" + pageNum, cargos);
      }
    }

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

    let checker = utill.appCache.has("activated_cargos-pageNum=" + pageNum);
    let cargos;

    if (checker) {
      cargos = utill.appCache.get("activated_cargos-pageNum=" + pageNum);
    } else {
      cargos = await db.dbs.Cargo.findAndCountAll({
        offset: offset,
        limit: limit,
        where: { status: "Activated" },
        order: [["id", "DESC"]],
      });
      if (cargos.rows.length > 0) {
        utill.appCache.set("activated_cargos-pageNum=" + pageNum, cargos);
      }
    }

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
      admin_id: req.user.id,
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
      data: JSON.stringify(req.body),
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

    let checker = utill.appCache.has("all-shippers-count-pageNum=" + pageNum);
    let shippers;

    if (checker) {
      shippers = utill.appCache.get("all-shippers-count-pageNum=" + pageNum);
    } else {
      shippers = await db.dbs.Users.findAndCountAll({
        attributes: {
          exclude: ["id", "password", "otp", "locked", "activated"],
        },
        offset: offset,
        limit: limit,
        where: { type: "Shipper" },
        order: [["id", "DESC"]],
      });
      if (shippers.rows.length > 0) {
        utill.appCache.set("all-shippers-count-pageNum=" + pageNum, shippers);
      }
    }

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

    let checker = utill.appCache.has(
      "all-activated-shippers-pageNum=" + pageNum
    );
    let activatedShippers;

    if (checker) {
      activatedShippers = utill.appCache.get(
        "all-activated-shippers-pageNum=" + pageNum
      );
    } else {
      activatedShippers = await db.dbs.Users.findAndCountAll({
        attributes: {
          exclude: ["id", "password", "otp", "locked", "activated"],
        },
        offset: offset,
        limit: limit,
        where: { type: "Shipper", verification_status: "completed" },
        order: [["id", "DESC"]],
      });
      if (activatedShippers.rows.length > 0) {
        utill.appCache.set(
          "all-activated-shippers-pageNum=" + pageNum,
          activatedShippers
        );
      }
    }

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

    let checker = utill.appCache.has(
      "all-declined-shippers-pageNum=" + pageNum
    );
    let declinedShippers;

    if (checker) {
      declinedShippers = utill.appCache.get(
        "all-declined-shippers-pageNum=" + pageNum
      );
    } else {
      declinedShippers = await db.dbs.Users.findAndCountAll({
        attributes: {
          exclude: ["id", "password", "otp", "locked", "activated"],
        },
        offset: offset,
        limit: limit,
        where: { type: "Shipper", verification_status: "declined" },
        order: [["id", "DESC"]],
      });
      if (declinedShippers.rows.length > 0) {
        utill.appCache.set(
          "all-declined-shippers-pageNum=" + pageNum,
          declinedShippers
        );
      }
    }

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

    let checker = utill.appCache.has("all-carriers-pageNum=" + pageNum);
    let carriers;
    if (checker) {
      carriers = utill.appCache.get("all-carriers-pageNum=" + pageNum);
    } else {
      carriers = await db.dbs.Users.findAndCountAll({
        attributes: {
          exclude: ["id", "password", "otp", "locked", "activated"],
        },
        offset: offset,
        limit: limit,
        where: { type: "Carrier" },
        order: [["id", "DESC"]],
      });
      if (carriers.rows.length > 0) {
        utill.appCache.set("all-carriers-pageNum=" + pageNum, carriers);
      }
    }

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

    let checker = utill.appCache.has(
      "all-activated-carriers-pageNum=" + pageNum
    );
    let activatedCarriers;
    if (checker) {
      activatedCarriers = utill.appCache.get(
        "all-activated-carriers-pageNum=" + pageNum
      );
    } else {
      activatedCarriers = await db.dbs.Users.findAndCountAll({
        attributes: {
          exclude: ["id", "password", "otp", "locked", "activated"],
        },
        offset: offset,
        limit: limit,
        where: { type: "Carrier", verification_status: "completed" },
        order: [["id", "DESC"]],
      });
      if (activatedCarriers.rows.length > 0) {
        utill.appCache.set(
          "all-activated-carriers-pageNum=" + pageNum,
          activatedCarriers
        );
      }
    }

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

    let checker = utill.appCache.has(
      "all-declined-carriers-pageNum=" + pageNum
    );
    let declinedCarriers;
    if (checker) {
      declinedCarriers = utill.appCache.get(
        "all-declined-carriers-pageNum=" + pageNum
      );
    } else {
      declinedCarriers = await db.dbs.Users.findAndCountAll({
        attributes: {
          exclude: ["id", "password", "otp", "locked", "activated"],
        },
        offset: offset,
        limit: limit,
        where: { type: "Carrier", verification_status: "declined" },
        order: [["id", "DESC"]],
      });
      if (declinedCarriers.rows.length > 0) {
        utill.appCache.set(
          "all-declined-carriers-pageNum=" + pageNum,
          declinedCarriers
        );
      }
    }

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

    let checker = utill.appCache.has("all-agents-pageNum=" + pageNum);
    let agents;
    if (checker) {
      agents = utill.appCache.get("all-agents-pageNum=" + pageNum);
    } else {
      agents = await db.dbs.Users.findAndCountAll({
        attributes: {
          exclude: ["id", "password", "otp", "locked", "activated"],
        },
        offset: offset,
        limit: limit,
        where: { type: "Agent" },
        order: [["id", "DESC"]],
      });
      utill.appCache.set("all-agents-pageNum=" + pageNum, agents);
    }

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

    let checker = utill.appCache.has("all-activated-agents-pageNum=" + pageNum);
    let activatedAgents;
    if (checker) {
      activatedAgents = utill.appCache.get(
        "all-activated-agents-pageNum=" + pageNum
      );
    } else {
      activatedAgents = await db.dbs.Users.findAndCountAll({
        attributes: {
          exclude: ["id", "password", "otp", "locked", "activated"],
        },
        offset: offset,
        limit: limit,
        where: { type: "Agent", verification_status: "completed" },
        order: [["id", "DESC"]],
      });
      if (activatedAgents.rows.length > 0) {
        utill.appCache.has("all-activated-agents-pageNum=" + pageNum);
      }
    }

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

    let checker = utill.appCache.has("all-declined-agents-pageNum=" + pageNum);
    let declinedAgents;
    if (checker) {
      declinedAgents = utill.appCache.get(
        "all-declined-agents-pageNum=" + pageNum
      );
    } else {
      declinedAgents = await db.dbs.Users.findAndCountAll({
        attributes: {
          exclude: ["id", "password", "otp", "locked", "activated"],
        },
        offset: offset,
        limit: limit,
        where: { type: "Agent", verification_status: "declined" },
        order: [["id", "DESC"]],
      });
      if (declinedAgents.rows.length > 0) {
        utill.appCache.set(
          "all-declined-agents-pageNum=" + pageNum,
          declinedAgents
        );
      }
    }

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

    const option = {
      name: `${user.first_name} ${user.last_name}`,
      email: user.email,
    };
    utill.verifySuccess.sendMail(option);

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

    let checker = utill.appCache.has("all-users-shipments-pageNum=" + pageNum);
    let allShipments;
    if (checker) {
      allShipments = utill.appCache.get(
        "all-users-shipments-pageNum=" + pageNum
      );
    } else {
      allShipments = await db.dbs.ShippingItems.findAndCountAll({
        offset: offset,
        limit: limit,
        order: [["id", "DESC"]],
      });
      utill.appCache.set(
        "all-users-shipments-pageNum=" + pageNum,
        allShipments
      );
    }

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

    let checker = utill.appCache.has("single-shipment-by-uuid" + uuid);
    let shipment;
    if (checker) {
      shipment = utill.appCache.get("single-shipment-by-uuid" + uuid);
    } else {
      shipment = await db.dbs.ShippingItems.findOne({
        where: { uuid: uuid },
      });
      utill.appCache.set("single-shipment-by-uuid" + uuid, shipment);
    }

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

    let checker = utill.appCache.has("single-user" + uuid);
    let user;

    if (checker) {
      user = utill.appCache.get("single-user" + uuid);
    } else {
      user = await db.dbs.Users.findOne({
        attributes: { exclude: [, "password", "otp", "locked", "activated"] },
        where: { uuid: uuid },
        include: [
          {
            model: db.dbs.BusinessCompliance,
            as: "business_compliance",
          },
          {
            model: db.dbs.Directors,
            as: "directors",
          },
          {
            model: db.dbs.Cargo,
            as: "cargo_owner",
          },
          {
            model: db.dbs.ShippingItems,
            as: "shipments_booked_on_flight",
          },
        ],
      });
      utill.appCache.set("single-user" + uuid, user);
    }

    if (!user) {
      return res
        .status(400)
        .json(utill.helpers.sendError("No user with this unique id found"));
    }

    return res.status(200).json({ user });
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

    let checker = utill.appCache.has(
      "all-users-pending-shipments-pageNum=" + pageNum
    );
    let pendingShipments;
    if (checker) {
      pendingShipments = utill.appCache.get(
        "all-users-pending-shipments-pageNum=" + pageNum
      );
    } else {
      pendingShipments = await db.dbs.ShippingItems.findAndCountAll({
        offset: offset,
        limit: limit,
        where: { status: "pending" },
        order: [["id", "DESC"]],
      });
      if (pendingShipments.rows.length > 0) {
        utill.appCache.set(
          "all-users-pending-shipments-pageNum=" + pageNum,
          pendingShipments
        );
      }
    }

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

    let checker = utill.appCache.has(
      "all-user-shipments-enroute-pageNum=" + pageNum
    );
    let enrouteShipments;
    if (checker) {
      enrouteShipments = utill.appCache.get(
        "all-user-shipments-enroute-pageNum=" + pageNum
      );
    } else {
      enrouteShipments = await db.dbs.ShippingItems.findAndCountAll({
        offset: offset,
        limit: limit,
        where: { status: "enroute" },
        order: [["id", "DESC"]],
      });
      utill.appCache.set(
        "all-user-shipments-enroute-pageNum=" + pageNum,
        enrouteShipments
      );
    }

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

    let checker = utill.appCache.has(
      "all-users-completed-shipments-pageNum=" + pageNum
    );
    let enrouteShipments;
    if (checker) {
      enrouteShipments = utill.appCache.get(
        "all-users-completed-shipments-pageNum=" + pageNum
      );
    } else {
      enrouteShipments = await db.dbs.ShippingItems.findAndCountAll({
        offset: offset,
        limit: limit,
        where: { status: "completed" },
        order: [["id", "DESC"]],
      });
      if (enrouteShipments.rows.length > 0) {
        utill.appCache.set(
          "all-users-completed-shipments-pageNum=" + pageNum,
          enrouteShipments
        );
      }
    }

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

  almostCompletedShipments: async (
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

    let checker = utill.appCache.has(
      "all-users-almost-completed-shipments-pageNum=" + pageNum
    );
    let almostCompletedShipments;
    if (checker) {
      almostCompletedShipments = utill.appCache.get(
        "all-users-almost-completed-shipments-pageNum=" + pageNum
      );
    } else {
      almostCompletedShipments = await db.dbs.ScheduleFlights.findAndCountAll({
        offset: offset,
        limit: limit,
        where: { status: "Almost completed" },
        order: [["id", "DESC"]],
      });
      utill.appCache.set(
        "all-users-almost-completed-shipments-pageNum=" + pageNum,
        almostCompletedShipments
      );
    }

    var next_page = currentPage + 1;
    var prev_page = currentPage - 1;
    var nextP =
      `/api/jetwest/admin/almost-completed-flights?pageNum=` + next_page;
    var prevP =
      `/api/jetwest/admin/almost-completed-flights?pageNum=` + prev_page;

    const meta = paginate(
      currentPage,
      almostCompletedShipments.count,
      almostCompletedShipments.rows,
      pageSize
    );

    return res.status(200).json({
      status: "SUCCESS",
      data: almostCompletedShipments,
      per_page: pageSize,
      current_page: currentPage,
      last_page: meta.pageCount, //transactions.count,
      first_page_url: `/api/jetwest/admin/almost-completed-flights?pageNum=1`,
      last_page_url:
        `/api/jetwest/admin/almost-completed-flights?pageNum=` + meta.pageCount, //transactions.count,
      next_page_url: nextP,
      prev_page_url: prevP,
      path: `/api/jetwest/admin/almost-completed-flights?pageNum=`,
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

    let checker = utill.appCache.has("all-system-users-pageNum=" + pageNum);
    let allUsers;
    if (checker) {
      allUsers = utill.appCache.get("all-system-users-pageNum=" + pageNum);
    } else {
      allUsers = await db.dbs.Users.findAndCountAll({
        attributes: {
          exclude: ["id", "password", "otp", "locked", "activated"],
        },
        offset: offset,
        limit: limit,
        order: [["id", "DESC"]],
        include: [
          {
            model: db.dbs.BusinessCompliance,
            as: "business_compliance",
          },
          {
            model: db.dbs.Directors,
            as: "directors",
          },
        ],
      });
      utill.appCache.set("all-system-users-pageNum=" + pageNum, allUsers);
    }

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

  allOutgoingLogistics: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    let { pageNum, airport } = req.query;

    if (!pageNum || isNaN(pageNum)) {
      return res
        .status(400)
        .json(utill.helpers.sendError("Kindly add a valid page number"));
    }

    var currentPage = parseInt(pageNum) ? parseInt(pageNum) : 1;

    var pageSize = 25;
    var page = currentPage - 1;
    const offset = page * pageSize;
    const limit = pageSize;

    var next_page = currentPage + 1; // SELECT *, IF(block_height-block > block_height, 0, block_height-block+1) confs_calc, IF(IF(block_height-block > block_height, 0, block_height-block+1) - min_conf >= 0, true, false) available FROM utxo LEFT JOIN bitcoin_confs ON 1 LIMIT 3 OFFSET 3
    var prev_page;
    if (currentPage === 1) {
      prev_page = 1;
    } else {
      prev_page = currentPage - 1;
    }
    var nextP =
      "/api/jetwest/admin/all_outgoing_logistics?pageNum=" +
      next_page +
      "&airport=" +
      airport;
    var prevP =
      "/api/jetwest/admin/all_outgoing_logistics?pageNum=" +
      prev_page +
      "&airport=" +
      airport;

    let allLogistics: any = [];

    var completed = await db.dbs.sequelize
      .query(
        "SELECT schedule_flights.id, schedule_flights.flight_reg, schedule_flights.createdAt as schedule_flights_createdAt, schedule_flights.uuid AS schedule_flights_uuid, schedule_flights.departure_date, schedule_flights.load_count, schedule_flights.offload_count, schedule_flights.destination_airport, schedule_flights.takeoff_airport, schedule_flights.status, schedule_flights.departure_station, schedule_flights.destination_station,schedule_flights.stoa, schedule_flights.stod, schedule_flights.taw, schedule_flights.no_of_bags FROM `schedule_flights` WHERE schedule_flights.takeoff_airport=:airport  ORDER BY `schedule_flights`.`createdAt` DESC limit :limit offset :offset;",
        {
          replacements: {
            limit: limit,
            offset: offset,
            airport: airport,
          }, // schedule_flights.takeoff_airport=:airport
          type: QueryTypes.SELECT,
        }
      )
      .then((objs: any) => {
        objs.forEach((obj: any) => {
          var id = obj.id;
          var flight_reg = obj.flight_reg;
          var destination_airport = obj.destination_airport;
          var takeoff_airport = obj.takeoff_airport;
          var schedule_flights_uuid = obj.schedule_flights_uuid;
          var departure_date = obj.departure_date;
          var departure_station = obj.departure_station;
          var destination_station = obj.destination_station;
          var stoa = obj.stoa;
          var load_count = obj.load_count;
          var offload_count = obj.offload_count;
          var stod = obj.stod;
          var taw = obj.taw;
          var no_of_bags = obj.no_of_bags;
          var status = obj.status;
          var schedule_flights_createdAt = obj.schedule_flights_createdAt;

          allLogistics.push({
            id,
            flight_reg,
            schedule_flights_uuid,
            departure_date,
            load_count,
            offload_count,
            takeoff_airport,
            destination_airport,
            departure_station,
            destination_station,
            status,
            stoa,
            stod,
            taw,
            no_of_bags,
            schedule_flights_createdAt,
          });
        });
      });

    const meta = paginate(
      currentPage,
      allLogistics.length,
      allLogistics,
      pageSize
    );

    let data = {
      count: allLogistics.length,
      rows: allLogistics,
    };

    return res.status(200).json({
      status: "SUCCESS",
      data: data,
      per_page: pageSize,
      current_page: currentPage,
      last_page: meta.pageCount, //transactions.count,
      first_page_url: `/api/jetwest/admin/all_incoming_logistics?pageNum=1&airport=${airport}`,
      last_page_url: `/api/jetwest/transactions/all_outgoing_logistics?pageNum=${meta.pageCount}&airport=${airport}`, //transactions.count,
      next_page_url: nextP,
      prev_page_url: prevP,
      path:
        "/api/jetwest/admin/all_outgoing_logistics?pageNum=" +
        pageNum +
        "&airport=" +
        airport,
      from: 1,
      to: meta.pageCount, //transactions.count,
    });
  },

  allIncomingLogistics: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    let { pageNum, airport } = req.query;

    if (!pageNum || isNaN(pageNum)) {
      return res
        .status(400)
        .json(utill.helpers.sendError("Kindly add a valid page number"));
    }

    var currentPage = parseInt(pageNum) ? parseInt(pageNum) : 1;

    var pageSize = 25;
    var page = currentPage - 1;
    const offset = page * pageSize;
    const limit = pageSize;

    var next_page = currentPage + 1; // SELECT *, IF(block_height-block > block_height, 0, block_height-block+1) confs_calc, IF(IF(block_height-block > block_height, 0, block_height-block+1) - min_conf >= 0, true, false) available FROM utxo LEFT JOIN bitcoin_confs ON 1 LIMIT 3 OFFSET 3
    var prev_page;
    if (currentPage === 1) {
      prev_page = 1;
    } else {
      prev_page = currentPage - 1;
    }
    var nextP =
      "/api/jetwest/admin/all_incoming_logistics?pageNum=" +
      next_page +
      "&airport=" +
      airport;
    var prevP =
      "/api/jetwest/admin/all_incoming_logistics?pageNum=" +
      prev_page +
      "&airport=" +
      airport;

    let allLogistics: any = [];

    // SELECT schedule_flights.id, schedule_flights.flight_reg, shipping_items.status, shipping_items.createdAt AS shipping_items_createdAt, shipping_items.uuid AS shipping_items_uuid, schedule_flights.createdAt as schedule_flights_createdAt, schedule_flights.uuid AS schedule_flights_uuid, schedule_flights.departure_date, schedule_flights.load_count, schedule_flights.offload_count, schedule_flights.destination_airport, schedule_flights.takeoff_airport, schedule_flights.departure_station, schedule_flights.destination_station,schedule_flights.stoa, schedule_flights.stod, schedule_flights.taw, shipping_items.no_of_bags FROM `schedule_flights`, shipping_items WHERE shipping_items.flight_id = schedule_flights.uuid AND schedule_flights.destination_airport=:airport  ORDER BY `schedule_flights`.`createdAt` DESC limit :limit offset :offset;

    var completed = await db.dbs.sequelize
      .query(
        "SELECT schedule_flights.id, schedule_flights.flight_reg, schedule_flights.createdAt as schedule_flights_createdAt, schedule_flights.uuid AS schedule_flights_uuid, schedule_flights.departure_date, schedule_flights.load_count, schedule_flights.offload_count, schedule_flights.destination_airport, schedule_flights.takeoff_airport, schedule_flights.status, schedule_flights.departure_station, schedule_flights.destination_station,schedule_flights.stoa, schedule_flights.stod, schedule_flights.taw, schedule_flights.no_of_bags FROM `schedule_flights` WHERE schedule_flights.destination_airport=:airport  ORDER BY `schedule_flights`.`createdAt` DESC limit :limit offset :offset;",
        {
          replacements: {
            limit: limit,
            offset: offset,
            airport: airport,
          },
          type: QueryTypes.SELECT,
        }
      )
      .then((objs: any) => {
        objs.forEach((obj: any) => {
          var id = obj.id;
          var flight_reg = obj.flight_reg;
          var destination_airport = obj.destination_airport;
          var takeoff_airport = obj.takeoff_airport;
          var schedule_flights_uuid = obj.schedule_flights_uuid;
          var departure_date = obj.departure_date;
          var departure_station = obj.departure_station;
          var destination_station = obj.destination_station;
          var stoa = obj.stoa;
          var load_count = obj.load_count;
          var offload_count = obj.offload_count;
          var stod = obj.stod;
          var taw = obj.taw;
          var no_of_bags = obj.no_of_bags;
          var status = obj.status;
          var schedule_flights_createdAt = obj.schedule_flights_createdAt;

          allLogistics.push({
            id,
            flight_reg,
            schedule_flights_uuid,
            departure_date,
            load_count,
            offload_count,
            takeoff_airport,
            destination_airport,
            departure_station,
            destination_station,
            status,
            stoa,
            stod,
            taw,
            no_of_bags,
            schedule_flights_createdAt,
          });
        });
      });

    const meta = paginate(
      currentPage,
      allLogistics.length,
      allLogistics,
      pageSize
    );

    // const meta = paginate(
    //   currentPage,
    //   allShipments.count,
    //   allShipments.rows,
    //   pageSize
    // );

    let data = {
      count: allLogistics.length,
      rows: allLogistics,
    };

    return res.status(200).json({
      status: "SUCCESS",
      data: data,
      per_page: pageSize,
      current_page: currentPage,
      last_page: meta.pageCount, //transactions.count,
      first_page_url: `/api/jetwest/admin/all_incoming_logistics?pageNum=1&airport=${airport}`,
      last_page_url: `/api/jetwest/transactions/all_incoming_logistics?pageNum=${meta.pageCount}&airport=${airport}`, //transactions.count,
      next_page_url: nextP,
      prev_page_url: prevP,
      path:
        "/api/jetwest/admin/all_incoming_logistics?pageNum=" +
        pageNum +
        "&airport=" +
        airport,
      from: 1,
      to: meta.pageCount, //transactions.count,
    });
  },

  scanBaggage: async (req: any, res: Response, next: NextFunction) => {
    let { refId, flight_id, scan_type, date } = req.query;

    if (!(refId && flight_id && scan_type && date)) {
      return res
        .status(400)
        .json(
          utill.helpers.sendError(
            "Enter a valid reference id flight id, scan type and schedule date"
          )
        );
    }

    let statusChecker = utill.appCache.has(
      req.url + refId + flight_id + scan_type + date
    );
    let status;
    if (statusChecker) {
      status = utill.appCache.get(
        req.url + refId + flight_id + scan_type + date
      );
    } else {
      status = await db.dbs.ShippingItems.findOne({
        where: {
          booking_reference: refId,
        },
      });
      utill.appCache.set(
        req.url + refId + flight_id + scan_type + date,
        status
      );
    }

    if (!status) {
      return res
        .status(400)
        .json(utill.helpers.sendError("Shipment not found"));
    }

    let vChecker = utill.appCache.has(
      "v" + status.flight_id + status.flight_id
    );
    let v;
    if (vChecker) {
      v = utill.appCache.get("v" + status.flight_id + status.flight_id);
    } else {
      v = await db.dbs.ScheduleFlights.findOne({
        where: { [Op.or]: { uuid: status.flight_id, id: status.flight_id } },
      });
      utill.appCache.set("v" + status.flight_id + status.flight_id, v);
    }

    if (!v) {
      return res.status(400).json(utill.helpers.sendError("flight not found"));
    }

    if (v.status === "Almost completed") {
      return res
        .status(400)
        .json(
          utill.helpers.sendError("Unable to scan bag flight is in progress")
        );
    }

    if (!JSON.parse(v.departure_date).includes(date)) {
      return res
        .status(400)
        .json(utill.helpers.sendError("Departure date not found on schedule"));
    }
    let allLogistics: any = [];

    var completed = await db.dbs.sequelize
      .query(
        "SELECT schedule_flights.id, schedule_flights.flight_reg, shipping_items.status, shipping_items.createdAt AS shipping_items_createdAt, shipping_items.id AS shipping_items_uuid, schedule_flights.createdAt as schedule_flights_createdAt, schedule_flights.id AS schedule_flights_uuid, shipping_items.depature_date, shipping_items.shipperName, schedule_flights.destination_airport, schedule_flights.takeoff_airport, schedule_flights.departure_station, schedule_flights.destination_station,schedule_flights.stoa, schedule_flights.stod, schedule_flights.taw, shipping_items.no_of_bags FROM `schedule_flights`, shipping_items WHERE schedule_flights.uuid=:uuid AND shipping_items.booking_reference=:shipment_ref AND shipping_items.depature_date=:date;",
        {
          replacements: {
            uuid: flight_id,
            date: date,
            shipment_ref: refId,
          },
          type: QueryTypes.SELECT,
        }
      )
      .then((objs: any) => {
        objs.forEach((obj: any) => {
          var id = obj.id;
          var flight_reg = obj.flight_reg;
          var destination_airport = obj.destination_airport;
          var takeoff_airport = obj.takeoff_airport;
          var shipperName = obj.shipperName;
          var shipping_items_uuid = obj.shipping_items_uuid;
          var schedule_flights_uuid = obj.schedule_flights_uuid;
          var departure_date = obj.departure_date;
          var departure_station = obj.departure_station;
          var destination_station = obj.destination_station;
          var stoa = obj.stoa;
          var stod = obj.stod;
          var taw = obj.taw;
          var no_of_bags = obj.no_of_bags;
          var status = obj.status;
          var shipping_items_createdAt = obj.shipping_items_createdAt;
          var schedule_flights_createdAt = obj.schedule_flights_createdAt;

          allLogistics.push({
            id,
            flight_reg,
            shipping_items_uuid,
            schedule_flights_uuid,
            departure_date,
            takeoff_airport,
            shipperName,
            destination_airport,
            departure_station,
            destination_station,
            status,
            stoa,
            stod,
            taw,
            no_of_bags,
            shipping_items_createdAt,
            schedule_flights_createdAt,
          });
        });
      });

    if (allLogistics.length > 0) {
      let departureChecker = utill.appCache.has(
        allLogistics[0].departure_station
      );
      let destinationChecker = utill.appCache.has(
        allLogistics[0].destination_station
      );
      let departure, destination;
      if (departureChecker) {
        departure = utill.appCache.get(allLogistics[0].departure_station);
      } else {
        departure = await db.dbs.Destinations.findOne({
          where: { state: allLogistics[0].departure_station },
        });
        utill.appCache.set(allLogistics[0].departure_station);
      }

      if (destinationChecker) {
        destination = utill.appCache.get(allLogistics[0].destination_station);
      } else {
        destination = await db.dbs.Destinations.findOne({
          where: { state: allLogistics[0].destination_station },
        });
        utill.appCache.set(allLogistics[0].destination_station);
      }

      console.log({ departure, destination });
      if (status) {
        if (scan_type === "load") {
          if (parseInt(v.load_count) === parseInt(v.no_of_bags)) {
            return res
              .status(400)
              .json(
                utill.helpers.sendError(
                  `Bags with reference ${refId} already scanned into flight with number ${allLogistics[0].flight_reg}`
                )
              );
          }
          if (status.progress === "loaded") {
            return res
              .status(200)
              .json(
                utill.helpers.sendSuccess(
                  `Shipment already loaded into aircraft with flight number ${allLogistics[0].flight_reg}`
                )
              );
          }

          status.progress = "loaded";
          status.status = "enroute";
          v.load_count = parseInt(v.load_count) + 1;
          await v.save();
          await status.save();

          await db.dbs.LoadedBags.create({
            uuid: utill.uuid(),
            flight_reg: allLogistics[0].flight_reg,
            shipping_items_uuid: allLogistics[0].shipping_items_uuid,
            schedule_flights_uuid: allLogistics[0].schedule_flights_uuid,
            departure_date: date,
            takeoff_airport: departure.name_of_airport,
            shipperName: allLogistics[0].shipperName,
            destination_airport: destination.name_of_airport,
            departure_station: allLogistics[0].departure_station,
            destination_station: allLogistics[0].destination_station,
            status: allLogistics[0].status,
            stoa: allLogistics[0].stoa,
            stod: allLogistics[0].stod,
            load_time: utill.moment().format("YYYY-MM-DD hh:mm:ss"),
            taw: allLogistics[0].taw,
            no_of_bags: allLogistics[0].no_of_bags,
            shipping_items_createdAt: new Date(
              allLogistics[0].shipping_items_createdAt
            )
              .toISOString()
              .split("T")
              .toString()
              .replace("000Z", ""),
            schedule_flights_createdAt: new Date(
              allLogistics[0].schedule_flights_createdAt
            )
              .toISOString()
              .split("T")
              .toString()
              .replace("000Z", ""),
          });
        } else if (scan_type === "offload") {
          if (parseInt(v.offload_count) === parseInt(v.no_of_bags)) {
            return res
              .status(400)
              .json(
                utill.helpers.sendError(
                  "Already offloaded successfully all bags from flight "
                )
              );
          }
          if (v.status != "completed") {
            return res
              .status(400)
              .json(utill.helpers.sendError("Flight not landed"));
          }
          if (status.progress === "landed") {
            return res
              .status(400)
              .json(utill.helpers.sendError("Shipment already offloaded"));
          }

          status.progress = "landed";
          v.offload_count = parseInt(v.offload_count) + 1;
          await v.save();
          await status.save();

          await db.dbs.OffLoadedBags.create({
            uuid: utill.uuid(),
            flight_reg: allLogistics[0].flight_reg,
            shipping_items_uuid: allLogistics[0].shipping_items_uuid,
            schedule_flights_uuid: allLogistics[0].schedule_flights_uuid,
            departure_date: date,
            takeoff_airport: departure.name_of_airport,
            shipperName: allLogistics[0].shipperName,
            destination_airport: destination.name_of_airport,
            departure_station: allLogistics[0].departure_station,
            destination_station: allLogistics[0].destination_station,
            status: allLogistics[0].status,
            offload_time: utill.moment().format("YYYY-MM-DD hh:mm:ss"),
            stoa: allLogistics[0].stoa,
            stod: allLogistics[0].stod,
            taw: allLogistics[0].taw,
            no_of_bags: allLogistics[0].no_of_bags,
            shipping_items_createdAt: new Date(
              allLogistics[0].shipping_items_createdAt
            )
              .toISOString()
              .split("T")
              .toString()
              .replace("000Z", ""),
            schedule_flights_createdAt: new Date(
              allLogistics[0].schedule_flights_createdAt
            )
              .toISOString()
              .split("T")
              .toString()
              .replace("000Z", ""),
          });

          return res
            .status(200)
            .json(
              utill.helpers.sendSuccess(
                `successfully off-loaded from aircraft with flight number ${allLogistics[0].flight_reg}`
              )
            );
        } else {
          return res
            .status(400)
            .json(
              utill.helpers.sendSuccess(
                `Kindly add a valid scan precedure; load or offload`
              )
            );
        }
        // if (status.progress === "completed") {
        //   return res
        //     .status(400)
        //     .json(utill.helpers.sendError("Shipment already completed"));
        // } else if (status.progress === "in-transit") {
        //   status.progress = "completed";
        //   await status.save();

        //   await db.dbs.OffLoadedBags.create({
        //     uuid: utill.uuid(),
        //     flight_reg: allLogistics[0].flight_reg,
        //     shipping_items_uuid: allLogistics[0].shipping_items_uuid,
        //     schedule_flights_uuid: allLogistics[0].schedule_flights_uuid,
        //     departure_date: allLogistics[0].departure_date,
        //     takeoff_airport: allLogistics[0].takeoff_airport,
        //     shipperName: allLogistics[0].shipperName,
        //     destination_airport: allLogistics[0].destination_airport,
        //     departure_station: allLogistics[0].departure_station,
        //     destination_station: allLogistics[0].destination_station,
        //     status: allLogistics[0].status,
        //     stoa: allLogistics[0].stoa,
        //     stod: allLogistics[0].stod,
        //     taw: allLogistics[0].taw,
        //     no_of_bags: allLogistics[0].no_of_bags,
        //     shipping_items_createdAt: new Date(
        //       allLogistics[0].shipping_items_createdAt
        //     )
        //       .toISOString()
        //       .split("T")
        //       .toString()
        //       .replace("000Z", ""),
        //     schedule_flights_createdAt: new Date(
        //       allLogistics[0].schedule_flights_createdAt
        //     )
        //       .toISOString()
        //       .split("T")
        //       .toString()
        //       .replace("000Z", ""),
        //   });

        //   return res
        //     .status(200)
        //     .json(
        //       utill.helpers.sendSuccess(
        //         `successfully off-loaded from aircraft with flight number ${allLogistics[0].flight_reg}`
        //       )
        //     );
        // } else {
        //   status.progress = "loaded";
        //   status.status = "enroute";
        //   await status.save();

        //   await db.dbs.LoadedBags.create({
        //     uuid: utill.uuid(),
        //     flight_reg: allLogistics[0].flight_reg,
        //     shipping_items_uuid: allLogistics[0].shipping_items_uuid,
        //     schedule_flights_uuid: allLogistics[0].schedule_flights_uuid,
        //     departure_date: allLogistics[0].departure_date,
        //     takeoff_airport: allLogistics[0].takeoff_airport,
        //     shipperName: allLogistics[0].shipperName,
        //     destination_airport: allLogistics[0].destination_airport,
        //     departure_station: allLogistics[0].departure_station,
        //     destination_station: allLogistics[0].destination_station,
        //     status: allLogistics[0].status,
        //     stoa: allLogistics[0].stoa,
        //     stod: allLogistics[0].stod,
        //     taw: allLogistics[0].taw,
        //     no_of_bags: allLogistics[0].no_of_bags,
        //     shipping_items_createdAt: new Date(
        //       allLogistics[0].shipping_items_createdAt
        //     )
        //       .toISOString()
        //       .split("T")
        //       .toString()
        //       .replace("000Z", ""),
        //     schedule_flights_createdAt: new Date(
        //       allLogistics[0].schedule_flights_createdAt
        //     )
        //       .toISOString()
        //       .split("T")
        //       .toString()
        //       .replace("000Z", ""),
        //   });
        // }
      }
      utill.appCache.flushAll();
      return res
        .status(200)
        .json(
          utill.helpers.sendSuccess(
            `Bag with reference number ${refId} has been loaded on the plane with flight number ${allLogistics[0].flight_reg} successfully`
          )
        );
    }

    return res
      .status(200)
      .json({ message: "Baggage not found on flight", flight_data: v });
  },

  allLoadedBags: async (req: any, res: Response, next: NextFunction) => {
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

    let checker = utill.appCache.has("all-loaded-bags-pageNum=" + pageNum);
    let allLoadedBags;
    if (checker) {
      allLoadedBags = utill.appCache.get("all-loaded-bags-pageNum=" + pageNum);
    } else {
      allLoadedBags = await await db.dbs.LoadedBags.findAndCountAll({
        offset: offset,
        limit: limit,
        order: [["createdAt", "DESC"]],
      });
      if (allLoadedBags.rows.length > 0) {
        utill.appCache.set("all-loaded-bags-pageNum=" + pageNum, allLoadedBags);
      }
    }

    var next_page = currentPage + 1;
    var prev_page = currentPage - 1;
    var nextP = `/api/jetwest/admin/all-loaded-bags?pageNum=` + next_page;
    var prevP = `/api/jetwest/admin//all-loaded-bags?pageNum=` + prev_page;

    const meta = paginate(
      currentPage,
      allLoadedBags.count,
      allLoadedBags.rows,
      pageSize
    );

    return res.status(200).json({
      status: "SUCCESS",
      data: allLoadedBags,
      per_page: pageSize,
      current_page: currentPage,
      last_page: meta.pageCount, //transactions.count,
      first_page_url: `/api/jetwest/admin/all-loaded-bags?pageNum=1`,
      last_page_url:
        `/api/jetwest/admin/all-loaded-bags?pageNum=` + meta.pageCount, //transactions.count,
      next_page_url: nextP,
      prev_page_url: prevP,
      path: `/api/jetwest/admin/all-loaded-bags?pageNum=`,
      from: 1,
      to: meta.pageCount, //transactions.count,
    });
  },

  filterLoadedBags: async (req: any, res: Response, next: NextFunction) => {
    const { pageNum, airport, all, today, seven, month, start, end } =
      req.query;
    let allLoadedBags;

    var currentPage = parseInt(pageNum) ? parseInt(pageNum) : 1;

    var page = currentPage - 1;
    var pageSize = 25;
    const offset = page * pageSize;
    const limit = pageSize;

    if (!pageNum || isNaN(pageNum)) {
      return res
        .status(400)
        .json(utill.helpers.sendError("Kindly add a valid page number"));
    }

    if (all) {
      allLoadedBags = await await db.dbs.LoadedBags.findAndCountAll({
        offset: offset,
        limit: limit,
        order: [["createdAt", "DESC"]],
        where: { takeoff_airport: airport },
      });
    } else if (today) {
      let startDate = utill
        .moment()
        .startOf("day")
        .format("YYYY-MM-DD HH:mm:ss");
      let endDate = utill.moment().endOf("day").format("YYYY-MM-DD HH:mm:ss");
      allLoadedBags = await await db.dbs.LoadedBags.findAndCountAll({
        offset: offset,
        limit: limit,
        where: {
          createdAt: {
            [Op.between]: [startDate, endDate],
          },
          takeoff_airport: airport,
        },
        order: [["createdAt", "DESC"]],
      });
    } else if (seven) {
      let startDate = utill
        .moment()
        .subtract(7, "days")
        .format("YYYY-MM-DD HH:mm:ss");
      let endDate = utill.moment().format("YYYY-MM-DD HH:mm:ss");

      allLoadedBags = await await db.dbs.LoadedBags.findAndCountAll({
        offset: offset,
        limit: limit,
        where: {
          createdAt: {
            [Op.between]: [startDate, endDate],
          },
          takeoff_airport: airport,
        },
        order: [["createdAt", "DESC"]],
      });
    } else if (month) {
      let startDate = utill
        .moment()
        .subtract(1, "month")
        .format("YYYY-MM-DD HH:mm:ss");
      let endDate = utill.moment().format("YYYY-MM-DD HH:mm:ss");

      allLoadedBags = await await db.dbs.LoadedBags.findAndCountAll({
        offset: offset,
        limit: limit,
        where: {
          createdAt: {
            [Op.between]: [startDate, endDate],
          },
          takeoff_airport: airport,
        },
        order: [["createdAt", "DESC"]],
      });
    } else if (start && end) {
      let startDate = utill.moment(start).format("YYYY-MM-DD HH:mm:ss");
      let endDate = utill.moment(end).format("YYYY-MM-DD HH:mm:ss");

      allLoadedBags = await await db.dbs.LoadedBags.findAndCountAll({
        offset: offset,
        limit: limit,
        where: {
          createdAt: {
            [Op.between]: [startDate, endDate],
          },
          takeoff_airport: airport,
        },
        order: [["createdAt", "DESC"]],
      });
    } else {
      return res
        .status(400)
        .json(utill.helpers.sendError("Kindly add a valid search paramter"));
    }

    var next_page = currentPage + 1;
    var prev_page = currentPage - 1;
    var nextP = `/api/jetwest/admin/filter-loaded-bags?pageNum=` + next_page;
    var prevP = `/api/jetwest/admin/filter-loaded-bags?pageNum=` + prev_page;

    const meta = paginate(
      currentPage,
      allLoadedBags.count,
      allLoadedBags.rows,
      pageSize
    );

    return res.status(200).json({
      status: "SUCCESS",
      data: allLoadedBags,
      per_page: pageSize,
      current_page: currentPage,
      last_page: meta.pageCount, //transactions.count,
      first_page_url: `/api/jetwest/admin/filter-loaded-bags?pageNum=1`,
      last_page_url:
        `/api/jetwest/admin/filter-loaded-bags?pageNum=` + meta.pageCount, //transactions.count,
      next_page_url: nextP,
      prev_page_url: prevP,
      path: `/api/jetwest/admin/filter-loaded-bags?pageNum=`,
      from: 1,
      to: meta.pageCount, //transactions.count,
    });
  },

  allOffLoadedBags: async (req: any, res: Response, next: NextFunction) => {
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

    let checker = utill.appCache.has("all-offloaded-bags-pageNum=" + pageNum);
    let allOffloadedBags;
    if (checker) {
      allOffloadedBags = utill.appCache.get(
        "all-offloaded-bags-pageNum=" + pageNum
      );
    } else {
      allOffloadedBags = await db.dbs.OffLoadedBags.findAndCountAll({
        offset: offset,
        limit: limit,
        order: [["createdAt", "DESC"]],
      });
      utill.appCache.set(
        "all-offloaded-bags-pageNum=" + pageNum,
        allOffloadedBags
      );
    }

    var next_page = currentPage + 1;
    var prev_page = currentPage - 1;
    var nextP = `/api/jetwest/admin/all-offloaded-bags?pageNum=` + next_page;
    var prevP = `/api/jetwest/admin/all-offloaded-bags?pageNum=` + prev_page;

    const meta = paginate(
      currentPage,
      allOffloadedBags.count,
      allOffloadedBags.rows,
      pageSize
    );

    return res.status(200).json({
      status: "SUCCESS",
      data: allOffloadedBags,
      per_page: pageSize,
      current_page: currentPage,
      last_page: meta.pageCount, //transactions.count,
      first_page_url: `/api/jetwest/admin/all-offloaded-bags?pageNum=1`,
      last_page_url:
        `/api/jetwest/admin/all-offloaded-bags?pageNum=` + meta.pageCount, //transactions.count,
      next_page_url: nextP,
      prev_page_url: prevP,
      path: `/api/jetwest/admin/all-offloaded-bags?pageNum=`,
      from: 1,
      to: meta.pageCount, //transactions.count,
    });
  },

  filterOffloadedBags: async (req: any, res: Response, next: NextFunction) => {
    const { pageNum, airport, all, today, seven, month, start, end } =
      req.query;
    let allOffLoadedBags;

    var currentPage = parseInt(pageNum) ? parseInt(pageNum) : 1;

    var page = currentPage - 1;
    var pageSize = 25;
    const offset = page * pageSize;
    const limit = pageSize;

    if (!pageNum || isNaN(pageNum)) {
      return res
        .status(400)
        .json(utill.helpers.sendError("Kindly add a valid page number"));
    }

    if (all) {
      allOffLoadedBags = await db.dbs.OffLoadedBags.findAndCountAll({
        offset: offset,
        limit: limit,
        order: [["createdAt", "DESC"]],
        where: { destination_airport: airport },
      });
    } else if (today) {
      let startDate = utill
        .moment()
        .startOf("day")
        .format("YYYY-MM-DD HH:mm:ss");
      let endDate = utill.moment().endOf("day").format("YYYY-MM-DD HH:mm:ss");
      allOffLoadedBags = await db.dbs.OffLoadedBags.findAndCountAll({
        offset: offset,
        limit: limit,
        where: {
          createdAt: {
            [Op.between]: [startDate, endDate],
            destination_airport: airport,
          },
        },
        order: [["createdAt", "DESC"]],
      });
    } else if (seven) {
      let startDate = utill
        .moment()
        .subtract(7, "days")
        .format("YYYY-MM-DD HH:mm:ss");
      let endDate = utill.moment().format("YYYY-MM-DD HH:mm:ss");

      allOffLoadedBags = await db.dbs.OffLoadedBags.findAndCountAll({
        offset: offset,
        limit: limit,
        where: {
          createdAt: {
            [Op.between]: [startDate, endDate],
          },
          destination_airport: airport,
        },
        order: [["createdAt", "DESC"]],
      });
    } else if (month) {
      let startDate = utill
        .moment()
        .subtract(1, "month")
        .format("YYYY-MM-DD HH:mm:ss");
      let endDate = utill.moment().format("YYYY-MM-DD HH:mm:ss");

      allOffLoadedBags = await db.dbs.OffLoadedBags.findAndCountAll({
        offset: offset,
        limit: limit,
        where: {
          createdAt: { [Op.between]: [startDate, endDate] },
          destination_airport: airport,
        },
        order: [["createdAt", "DESC"]],
      });
    } else if (start && end) {
      let startDate = utill.moment(start).format("YYYY-MM-DD HH:mm:ss");
      let endDate = utill.moment(end).format("YYYY-MM-DD HH:mm:ss");

      allOffLoadedBags = await db.dbs.OffLoadedBags.findAndCountAll({
        offset: offset,
        limit: limit,
        where: {
          createdAt: { [Op.between]: [startDate, endDate] },
          destination_airport: airport,
        },
        order: [["createdAt", "DESC"]],
      });
    } else {
      return res
        .status(400)
        .json(utill.helpers.sendError("Kindly add a valid search paramter"));
    }

    var next_page = currentPage + 1;
    var prev_page = currentPage - 1;
    var nextP = `/api/jetwest/admin/filter-offloaded-bags?pageNum=` + next_page;
    var prevP = `/api/jetwest/admin/filter-offloaded-bags?pageNum=` + prev_page;

    const meta = paginate(
      currentPage,
      allOffLoadedBags.count,
      allOffLoadedBags.rows,
      pageSize
    );

    return res.status(200).json({
      status: "SUCCESS",
      data: allOffLoadedBags,
      per_page: pageSize,
      current_page: currentPage,
      last_page: meta.pageCount, //transactions.count,
      first_page_url: `/api/jetwest/admin/filter-offloaded-bags?pageNum=1`,
      last_page_url:
        `/api/jetwest/admin/filter-offloaded-bags?pageNum=` + meta.pageCount, //transactions.count,
      next_page_url: nextP,
      prev_page_url: prevP,
      path: `/api/jetwest/admin/filter-offloaded-bags?pageNum=`,
      from: 1,
      to: meta.pageCount, //transactions.count,
    });
  },
};
