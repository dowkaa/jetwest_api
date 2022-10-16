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
