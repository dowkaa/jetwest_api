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
          .json(utillz.helpers.sendError("Kindly enter a valid mobile number"));
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
