const utilz = require("../utils/packages");
import { Request, Response, NextFunction } from "express";
const db = require("../database/mysql");
const { Op, QueryTypes } = require("sequelize");

module.exports = {
  getFags: async (req: Request, res: Response, next: NextFunction) => {
    let faqs = await db.dbs.Faqs.findAll();

    return res.status(200).json({ faqs });
  },

  getTestimonials: async (req: Request, res: Response, next: NextFunction) => {
    let testimonials = await db.dbs.Testimonials.findAll();

    return res.status(200).json({ testimonials });
  },

  postMailing: async (req: Request, res: Response, next: NextFunction) => {
    const loginSchema = utilz.Joi.object()
      .keys({
        email: utilz.Joi.string().required(),
      })
      .unknown();

    const validate = loginSchema.validate(req.body);

    if (validate.error != null) {
      const errorMessage = validate.error.details
        .map((i: any) => i.message)
        .join(".");
      return res.status(400).json(utilz.helpers.sendError(errorMessage));
    }

    await db.dbs.Mailing.create({
      uuid: utilz.uuid(),
      email: req.body.email,
    });

    return res
      .status(200)
      .json(
        utilz.helpers.sendSuccess("Email successfully added to mailing list")
      );
  },

  getInTouch: async (req: any, res: Response, next: NextFunction) => {
    const loginSchema = utilz.Joi.object()
      .keys({
        email: utilz.Joi.string().required(),
        firstname: utilz.Joi.string().required(),
        lastname: utilz.Joi.string().required(),
        message: utilz.Joi.string().required(),
      })
      .unknown();

    const validate = loginSchema.validate(req.body);

    if (validate.error != null) {
      const errorMessage = validate.error.details
        .map((i: any) => i.message)
        .join(".");
      return res.status(400).json(utilz.helpers.sendError(errorMessage));
    }

    const { email, firstname, lastname, message } = req.body;

    await db.dbs.ContactUs.create({
      uuid: utilz.uui,
      email,
      firstname,
      lastname,
      message,
    });

    const option = {
      name: `${firstname} ${lastname}`,
      message,
      email,
    };

    utilz.contactUs.sendMails(option);

    return res
      .status(200)
      .json(
        utilz.helpers.sendSuccess(
          "Thanks for taking your time to send us a message about your thoughts, we really appreciate and would reach out if it demands. Thank you."
        )
      );
  },

  requestOtp: async (
    req: { query: { email: string; mobile: string } },
    res: Response,
    next: NextFunction
  ) => {
    let { email, mobile } = req.query;

    var code = utilz.helpers.generateClientId(6);

    if (email) {
      if (!email || !email.includes("@")) {
        return res
          .status(400)
          .json(utilz.helpers.sendError("Kindly enter a valid email"));
      }

      let user = await db.dbs.Users.findOne({
        where: { email: email },
      });

      if (!user) {
        return res.status(400).json(utilz.helpers.sendError("User not found"));
      }

      if (user.activated === 1) {
        return res
          .status(400)
          .json(
            utilz.helpers.sendError(
              "Email already validated, kindly login to your account"
            )
          );
      }

      if (user.otp) {
        return res
          .status(400)
          .json(
            utilz.helpers.sendError(
              "Code already sent, kindly wait for 4 minutes to request another code"
            )
          );
      }

      user.otp = code;
      await user.save();

      const option = {
        email: email,
        name: `${user.first_name} ${user.last_name}`,
        otp: code,
      };
      utilz.verify.sendMail(option);

      await utilz.helpers.deactivateOtp(email);
    } else if (mobile) {
      if (/[a-zA-Z]/.test(mobile)) {
        return res
          .status(400)
          .json(utilz.helpers.sendError("Kindly enter a valid mobile number"));
      }

      let user = await db.dbs.Users.findOne({
        where: { mobile_number: mobile },
      });

      if (!user) {
        return res.status(400).json(utilz.helpers.sendError("User not found"));
      }

      if (user.activated === 1) {
        return res
          .status(400)
          .json(
            utilz.helpers.sendError(
              "Email already validated, kindly login to your account"
            )
          );
      }

      if (user.otp) {
        return res
          .status(400)
          .json(
            utilz.helpers.sendError(
              "Code already sent, kindly wait for 4 minutes to request another code"
            )
          );
      }

      user.otp = code;
      await user.save();

      const message = `Thanks for joining the Dowkaa team, we promise to serve your shiping needs. Kindly use the token ${code} to activate your account. 
        Thanks.`;
      // utilz.welcome.sendMail(option);

      await utilz.helpers.deactivateOtp(mobile);
    } else {
      return res
        .status(400)
        .json(utilz.helpers.sendError("Kindly add a valid query parameter"));
    }

    return res
      .status(200)
      .json(
        utilz.helpers.sendSuccess(
          `kindly activate account with otp code sent to your ${
            email ? "email address" : "mobile number"
          } `
        )
      );
  },

  updateRegStatus: async (
    req: { query: { email: string; status: string } },
    res: Response,
    next: NextFunction
  ) => {
    let { email, status } = req.query;

    if (!email && status) {
      return res
        .status(400)
        .json(utilz.helpers.sendError("Enter a valid search parameter"));
    }
    let user = await db.dbs.Users.findOne({
      where: { email: email },
    });

    if (!user) {
      return res.status(400).json(utilz.helpers.sendError("User not found"));
    }

    user.reg_status = status;
    await user.save();

    return res
      .status(200)
      .json(
        utilz.helpers.sendSuccess(
          "User registration status updated successfully"
        )
      );
  },

  allCargos: async (req: Request, res: Response, next: NextFunction) => {
    let cargos = await db.dbs.Cargo.findAll();

    return res.status(200).json({ cargos });
  },

  singleCargo: async (
    req: { query: { cargo_id: string } },
    res: Response,
    next: NextFunction
  ) => {
    let id = req.query.cargo_id;
    if (!id) {
      return res
        .status(400)
        .json(utilz.helpers.sendError("Enter a valid search parameter"));
    }
    let cargo = await db.dbs.Cargo.findAll({ where: { uuid: id } });

    if (!cargo) {
      return res.status(400).json(utilz.helpers.sendError("Cargo not found"));
    }

    return res.status(200).json({ cargo });
  },

  getRate: async (req: any, res: Response, next: NextFunction) => {
    let rate = await db.dbs.Rates.findOne();

    return res.status(200).json({ rate });
  },

  getRegStatus: async (
    req: { query: { email: string } },
    res: Response,
    next: NextFunction
  ) => {
    let { email } = req.query;
    let user = await db.dbs.Users.findOne({
      where: { email: email },
    });

    if (!user) {
      return res.status(400).json(utilz.helpers.sendError("User not found"));
    }

    return res
      .status(200)
      .json({ status: user.reg_status, account_type: user.type });
  },

  shipmentRoutes: async (req: Request, res: Response, next: NextFunction) => {
    let routes = await db.dbs.ShipmentRoutes.findAll();

    return res.status(200).json({ routes });
  },

  allAgents: async (req: Request, res: Response, next: NextFunction) => {
    let airport = req.query.airport;
    if (!airport) {
      return res
        .status(400)
        .json(utilz.helpers.sendError("Enter a valid search parameter"));
    }

    let agents = await db.dbs.Users.findAll({
      where: {
        airport: airport,
        type: "Agent",
        verification_status: "completed",
      },
    });

    let arr = [];

    for (const agent of agents) {
      const Directors = await db.dbs.Directors.findAll({
        where: { user_id: agent.uuid },
      });
      const user = {
        uuid: agent.uuid,
        first_name: agent.first_name,
        last_name: agent.last_name,
        customer_id: agent.customer_id,
        username: agent.username,
        email: agent.email,
        country: agent.country,
        mobile_number: agent.mobile_number,
        airport: agent.airport,
        company_name: agent.company_name,
        company_address: agent.company_address,
        companyFounded: agent.companyFounded,
        type: agent.type,
        ratePerKg: agent.ratePerkg,
        locked: agent.locked,
        activated: agent.activated,
        Directors,
      };

      arr.push(user);
    }

    return res.status(200).json({ arr });
  },

  singleAgent: async (
    req: { query: { id: string } },
    res: Response,
    next: NextFunction
  ) => {
    let uuid = req.query.id;
    if (!uuid) {
      return res
        .status(400)
        .json(utilz.helpers.sendError("Enter a valid search parameter"));
    }
    let agent = await db.dbs.Users.findOne({ where: { uuid: uuid } });

    if (!agent) {
      return res.status(400).json(utilz.helpers.sendError("Agent not found"));
    }

    const Directors = await db.dbs.Directors.findAll({
      where: { user_id: agent.uuid },
    });
    const user = {
      uuid: agent.uuid,
      first_name: agent.first_name,
      last_name: agent.last_name,
      customer_id: agent.customer_id,
      username: agent.username,
      email: agent.email,
      country: agent.country,
      mobile_number: agent.mobile_number,
      company_name: agent.company_name,
      company_address: agent.company_address,
      companyFounded: agent.companyFounded,
      type: agent.type,
      ratePerKg: agent.ratePerkg,
      locked: agent.locked,
      activated: agent.activated,
      Directors,
    };

    return res.status(200).json({ agent: user });
  },

  getShippingData: async (req: Request, res: Response, next: NextFunction) => {
    let refId = req.query.refId;

    if (!refId) {
      return res
        .status(400)
        .json(utilz.helpers.sendError("Enter a valid reference id"));
    }

    let data = await db.dbs.ShippingItems.findOne({
      where: { booking_reference: refId },
    });

    // if (!data) {
    //   let data2 = await db.dbs.ShippingItems.findOne({
    //     where: { shipment_num: refId },
    //   });

    //   if (data2) {
    //     return res.status(200).json(utilz.helpers.sendSuccess({ data: data2 }));
    //   }

    //   return res
    //     .status(400)
    //     .json(
    //       utilz.helpers.sendError("Booking data with reference id not found")
    //     );
    // }
    return res.status(200).json(utilz.helpers.sendSuccess({ data }));
  },

  checkPromo: async (req: Request, res: Response, next: NextFunction) => {
    let code = req.query.code;
    if (!code) {
      return res
        .status(400)
        .json(utilz.helpers.sendError("Enter a valid search parameter"));
    }

    let checker = await db.dbs.Promotions.findOne({ where: { code: code } });

    if (!checker) {
      return res
        .status(400)
        .json(utilz.helpers.sendError("Invalid promo code"));
    }

    if (checker.is_active === 0) {
      return res
        .status(200)
        .json(utilz.helpers.sendSuccess("Promo is not active"));
    }

    let currentDate = Date.now();
    let startDate = Date.parse(checker.startDate);
    let endDate = Date.parse(checker.endDate);

    if (currentDate < startDate) {
      return res
        .status(200)
        .json(utilz.helpers.sendSuccess("Promo not yet started"));
    }

    if (currentDate >= startDate && currentDate < endDate) {
      return res
        .status(200)
        .json(utilz.helpers.sendSuccess("Promo is currently ongoing"));
    }

    if (currentDate > endDate && currentDate > startDate) {
      return res
        .status(200)
        .json(utilz.helpers.sendSuccess("Promo has elapsed"));
    }

    return "invalid";
  },

  allPendingShipments: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { pickup_location, destination } = req.query;
    if (!(pickup_location && destination)) {
      return res
        .status(400)
        .json(
          utilz.helpers.sendError(
            "Kindly add valid pick up location and destintion"
          )
        );
    }
    let checker = await db.dbs.ScheduleFlights.findAll({
      where: {
        departure_station: pickup_location,
        destination_station: destination,
        status: "pending",
      },
      include: [
        {
          model: db.dbs.Cargo,
          as: "cargo",
        },
      ],
    });

    return res.status(200).json({ data: checker });
  },

  checkFlightAvailability: async (
    req: any,
    res: Response,
    next: NextFunction
  ) => {
    const { pickup_location, destination, stod, total_weight, date } =
      req.query;

    if (!(pickup_location && destination && stod && total_weight && date)) {
      return res
        .status(400)
        .json(
          utilz.helpers.sendError(
            "Kindly add valid pick up location, destintion stod and total weight"
          )
        );
    }

    let v = await db.dbs.ScheduleFlights.findOne({
      where: {
        departure_station: pickup_location,
        destination_station: destination,
        stod: stod,
        status: "pending",
      },
    });

    if (!v) {
      return res
        .status(400)
        .json(
          utilz.helpers.sendError(
            "Flight for destination and time not available"
          )
        );
    }

    let arr = JSON.parse(v.departure_date);

    if (!arr.includes(date)) {
      return res
        .status(400)
        .json(
          utilz.helpers.sendError(
            `Scheduled flight not available for the departure date entered kindly reschedule for another departure date`
          )
        );
    }

    if (Date.parse(date + " " + stod) - new Date().getTime() <= 1079999) {
      return res
        .status(400)
        .json(
          utilz.helpers.sendError(
            "Flight not available for booking, already in transit"
          )
        );
    }

    if (v.available_capacity < parseInt(total_weight)) {
      return res
        .status(400)
        .json(
          utilz.helpers.sendError(
            "Flight not availbale to carry total weight, kindly book another flight or contact customer support"
          )
        );
    }

    return res.status(200).json(utilz.helpers.sendSuccess("Flight available"));
  },

  getStod: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const { pickup_location, destination, date } = req.query;

    if (!(pickup_location && destination && date)) {
      return res
        .status(400)
        .json(
          utilz.helpers.sendError(
            "Kindly add valid pick up location, destintion stod and total weight"
          )
        );
    }

    let v = await db.dbs.ScheduleFlights.findAll({
      where: {
        departure_station: pickup_location,
        destination_station: destination,
      },
    });
    let arr = [];

    if (v.length > 0) {
      for (const item of v) {
        if (JSON.parse(item.departure_date).includes(date)) {
          arr.push(item);
        }
      }
    }

    return res.status(200).json({ arr });
  },

  getAllCargoTypes: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    let cargoTypes = await db.dbs.CargoTypes.findAll();

    return res.status(200).json({ cargoTypes });
  },

  test: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    let v = await db.dbs.ShippingItems.update(
      { progress: "in-transit" },
      {
        where: {
          status: "enroute",
        },
      }
    )
      .then((res: any) => console.log({ res }))
      .catch((err: any) => console.log({ err }));

    return res.status(200).json(utilz.helpers.sendSuccess("Flight available"));
  },

  getApiDocs: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    let email = req.query.email;
    if (!email) {
      return res
        .status(400)
        .json(utilz.helpers.sendError("Kindly add a valid email"));
    }

    let user = await db.dbs.Users.findOne({ where: { email: email } });

    if (!user) {
      return res
        .status(400)
        .json(
          utilz.helpers.sendError(
            "Kindly register an account with us to get our API documentation"
          )
        );
    }

    if (user.verification_status !== "completed") {
      return res
        .status(400)
        .json(
          utilz.helpers.sendError(
            "Account under verification, kindly try again later."
          )
        );
    }

    let option;

    if (user.type === "Carrier") {
      option = {
        message:
          "Kindly find below a link to the postman API documentation. Thanks",
        name: user.first_name + " " + user.last_name,
        type: "Carriers",
        link: "https://documenter.getpostman.com/view/20849152/2s93CKNZXZ",
        email: user.email,
      };
    } else if (user.type === "Shipper") {
      option = {
        message:
          "Kindly find below a link to the postman API documentation. Thanks",
        name: user.first_name + " " + user.last_name,
        type: "Shippers",
        link: "https://documenter.getpostman.com/view/20849152/2s93CKNZXX",
        email: user.email,
      };
    } else if (user.type === "Agent") {
      option = {
        message:
          "Kindly find below a link to the postman API documentation. Thanks",
        name: user.first_name + " " + user.last_name,
        type: "Agents",
        link: "https://documenter.getpostman.com/view/20849152/2s93CKNZXc",
        email: user.email,
      };
    } else {
    }

    utilz.apiDocs.sendMail(option);

    return res
      .status(200)
      .json(
        utilz.helpers.sendSuccess(
          "Kindly check your email for API documentation. Thanks."
        )
      );
  },
};
