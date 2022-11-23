const utilz = require("../utils/packages");
import { Request, Response, NextFunction } from "express";
const db = require("../database/mysql");

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
        message: `Thanks for Jetwest the Jetwest team, we promise to serve your shiping needs. Kindly use the token ${code} to activate your account. 
        Thanks.`,
      };
      utilz.welcome.sendMail(option);

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

      const message = `Thanks for Jetwest the Jetwest team, we promise to serve your shiping needs. Kindly use the token ${code} to activate your account. 
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
          "kindly activate account with otp code sent to your mobile number"
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
    let cargos = await db.dbs.Cargo.findAll({ where: { is_available: 1 } });

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

    return res.status(200).json({ status: user.reg_status });
  },

  shipmentRoutes: async (req: Request, res: Response, next: NextFunction) => {
    let routes = await await db.dbs.ShipmentRoutes.findAll();

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
      where: { airport: airport, type: "Agent" },
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

    if (!data) {
      let data2 = await db.dbs.ShippingItems.findOne({
        where: { shipment_num: refId },
      });

      if (data2) {
        return res.status(200).json(utilz.helpers.sendSuccess({ data: data2 }));
      }

      return res
        .status(400)
        .json(
          utilz.helpers.sendError("Booking data with reference id not found")
        );
    }
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
};
