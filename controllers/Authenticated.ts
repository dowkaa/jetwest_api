import { Request, Response, NextFunction } from "express";
const util = require("../utils/packages");
import { Query } from "express-serve-static-core";
const db = require("../database/mysql");

interface TypedRequestBody<T extends Query, U, R> extends Express.Request {
  body: U;
  query: T;
  user: R;
}

module.exports = {
  getProfile: async (
    req: TypedRequestBody<
      {},
      {},
      {
        email: string;
        customer_id: string;
        uuid: string;
        activated: string;
        locked: string;
        username: string;
        company_name: string;
        mobile_number: string;
        country: string;
        Area_street_sector_village: string;
        contact_personal_full_name: string;
        postal_code: string;
        primary_contact: string;
        state: string;
        secondary_contact: string;
        type: string;
      }
    >,
    res: Response,
    next: NextFunction
  ) => {
    const Directors = await db.dbs.Directors.findAll({
      where: { user_id: req.user.uuid },
    });

    const user = {
      customer_id: req.user.customer_id,
      username: req.user.username,
      email: req.user.email,
      activated: req.user.activated,
      locked: req.user.locked,
      company_name: req.user.company_name,
      mobile_number: req.user.mobile_number,
      primary_contact: req.user.primary_contact,
      country: req.user.country,
      address: req.user.Area_street_sector_village,
      contact_personal_full_name: req.user.contact_personal_full_name,
      postal_code: req.user.postal_code,
      secondary_contact: req.user.secondary_contact,
      state: req.user.state,
      type: req.user.type,
      Directors,
    };
    return res.status(200).json({ user });
  },

  addCargo: async (req: any, res: Response, next: NextFunction) => {
    const loginSchema = util.Joi.object()
      .keys({
        capacity: util.Joi.number().required(),
        available_capacity: util.Joi.number().required(),
        take_off: util.Joi.string().required(),
        geo_coverage: util.Joi.string().required(),
        monthly_flight_time: util.Joi.string().required(),
        is_available: util.Joi.string().required(),
        airworthiness_type: util.Joi.string().required(),
        airworthiness_make: util.Joi.string().required(),
        airworthiness_model: util.Joi.string().required(),
        airworthiness_cert_url: util.Joi.string().required(),
        aircraft_registration: util.Joi.string().required(),
        airworthiness_cert_exp_date: util.Joi.string().required(),
        noise_cert_url: util.Joi.string().required(),
        noise_cert_exp_date: util.Joi.string().required(),
        insurance_cert_url: util.Joi.string().required(),
        insurance_cert_exp_date: util.Joi.string().required(),
        registration_cert: util.Joi.string().required(),
        registration_cert_exp_date: util.Joi.string().required(),
        mmel: util.Joi.string().required(),
        ops_manual: util.Joi.string().required(),
      })
      .unknown();

    const validate = loginSchema.validate(req.body);

    if (validate.error != null) {
      const errorMessage = validate.error.details
        .map((i: any) => i.message)
        .Join(".");
      return res.status(400).json(util.helpers.sendError(errorMessage));
    }

    const {
      capacity,
      available_capacity,
      take_off,
      geo_coverage,
      monthly_flight_time,
      is_available,
      airworthiness_type,
      airworthiness_make,
      airworthiness_model,
      airworthiness_cert_url,
      aircraft_registration,
      airworthiness_cert_exp_date,
      noise_cert_url,
      noise_cert_exp_date,
      insurance_cert_url,
      insurance_cert_exp_date,
      registration_cert,
      registration_cert_exp_date,
      mmel,
      ops_manual,
    } = req.body;

    let data = await db.dbs.Quotes.create({
      uuid: util.uuid(),
      owner_id: req.user.uuid,
      capacity,
      available_capacity,
      take_off,
      geo_coverage,
      monthly_flight_time,
      is_available,
      airworthiness_type,
      airworthiness_make,
      airworthiness_model,
      airworthiness_cert_url,
      aircraft_registration,
      airworthiness_cert_exp_date,
      noise_cert_url,
      noise_cert_exp_date,
      insurance_cert_url,
      insurance_cert_exp_date,
      registration_cert,
      registration_cert_exp_date,
      mmel,
      ops_manual,
    });

    if (data) {
      return res
        .status(200)
        .json(
          util.helpers.sendSuccess(
            "Cargo added successfully for review, kindly hold while your cargo documents are being reviewd"
          )
        );
    }

    return res
      .status(400)
      .json(util.helpers.sendError("Error, kindly try again"));
  },

  requestQuote: async (req: any, res: Response, next: NextFunction) => {
    const loginSchema = util.Joi.object()
      .keys({
        type: util.Joi.string().required(),
        company_name: util.Joi.string().required(),
        email: util.Joi.string().required(),
        primary_phone: util.Joi.string().required(),
        contact_fullname: util.Joi.string().required(),
        phone_number: util.Joi.string().required(),
        secondary_phone: util.Joi.string().required(),
        length: util.Joi.number().required(),
        width: util.Joi.number().required(),
        heigth: util.Joi.number().required(),
        weight: util.Joi.number().required(),
        content: util.Joi.string().required(),
        value: util.Joi.string().required(),
        pick_up: util.Joi.string().required(),
        destination: util.Joi.string().required(),
      })
      .unknown();

    const validate = loginSchema.validate(req.body);

    if (validate.error != null) {
      const errorMessage = validate.error.details
        .map((i: any) => i.message)
        .Join(".");
      return res.status(400).json(util.helpers.sendError(errorMessage));
    }

    const {
      type,
      company_name,
      email,
      primary_phone,
      contact_fullname,
      phone_number,
      secondary_phone,
      length,
      width,
      weight,
      heigth,
      content,
      value,
      pick_up,
      destination,
    } = req.body;

    let data = await db.dbs.Quotes.create({
      uuid: util.uuid(),
      user_id: req.user.uuid,
      type,
      company_name,
      email,
      primary_phone,
      contact_fullname,
      phone_number,
      secondary_phone,
      length,
      sur_charge: 10,
      taxes: 10,
      cargo_id: "",
      width,
      weight,
      heigth,
      content,
      value,
      pick_up,
      destination,
    });

    if (data) {
      return res
        .status(200)
        .json(
          util.helpers.sendSuccess(
            "Your request was successfully submitted jetwest team will reach out to you shortly"
          )
        );
    }

    return res
      .status(400)
      .json(util.helpers.sendError("Error, kindly try again"));
  },

  bookShipping: async (req: any, res: Response, next: NextFunction) => {
    const itemSchema = util.Joi.object()
      .keys({
        items: util.Joi.array().required(),
      })
      .unknown();

    const validate1 = itemSchema.validate(req.body);

    if (validate1.error != null) {
      const errorMessage = validate1.error.details
        .map((i: any) => i.message)
        .Join(".");
      return res.status(400).json(util.helpers.sendError(errorMessage));
    }

    const bookingSchema = util.Joi.object()
      .keys({
        type: util.Joi.string().required(),
        pickup_location: util.Joi.string().required(),
        depature_date: util.Joi.string().required(),
        cargo_id: util.Joi.string().required(),
        destination: util.Joi.string().required(),
        width: util.Joi.number().required(),
        length: util.Joi.number().required(),
        weight: util.Joi.number().required(),
        height: util.Joi.number().required(),
        category: util.Joi.string().required(),
        promo_code: util.Joi.string().allow(""),
        value: util.Joi.number().required(),
        content: util.Joi.string().required(),
      })
      .unknown();

    // based on destination country the insurance cost differs for fragile goods, add country to table

    const validate = bookingSchema.validate(req.body.items[0]);

    if (validate.error != null) {
      const errorMessage = validate.error.details
        .map((i: any) => i.message)
        .join(".");
      return res.status(400).json(util.helpers.sendError(errorMessage));
    }

    const data = req.body.items;

    for (const item of data) {
      let price;
      const {
        type,
        pickup_location,
        destination,
        width,
        height,
        weight,
        length,
        cargo_id,
        category,
        promo_code,
        depature_date,
        value,
        content,
      } = item;

      let cargo = await db.dbs.Cargo.findOne({ where: { uuid: cargo_id } });

      // let insurance = 1;

      //   if (type === "Fragile") {
      //   insurance =
      // }
      if (!cargo) {
        return res.status(400).json(util.helpers.sendError("Cargo not found"));
      }
      let chargeable_weight;
      let volumetric_weight =
        (parseInt(width) * parseInt(height) * parseInt(length)) / 5000;

      chargeable_weight =
        volumetric_weight > parseInt(weight)
          ? volumetric_weight
          : parseInt(weight);

      if (promo_code) {
        let checkPromo = await util.helpers.checkPromo(promo_code);

        if (checkPromo.message != "Promo is currently ongoing") {
          return res
            .status(400)
            .json(util.helpers.sendError(checkPromo.message));
        }

        let discount = checkPromo.checker.percentage;

        price =
          chargeable_weight * req.user.ratePerKg * (parseInt(discount) / 100);
      } else {
        price = chargeable_weight * req.user.ratePerKg;
      }

      let reference = util.helpers.generateReftId(10);

      let status = await db.dbs.ShippingItems.create({
        uuid: util.uuid(),
        type,
        user_id: req.user.uuid,
        cargo_id,
        pickup_location,
        destination,
        depature_date,
        width,
        height,
        sur_charge: 10,
        taxes: 10,
        weight,
        booking_reference: reference,
        volumetric_weight,
        price: price,
        category,
        promo_code: promo_code ? promo_code : null,
        value,
        content,
      });

      // available_capacity is based on which of this is bigger volumetric_weight and weight

      if (parseInt(weight) > volumetric_weight) {
        cargo.available_capacity =
          parseInt(cargo.available_capacity) - parseInt(weight);
        await cargo.save();
      } else {
        cargo.available_capacity =
          parseInt(cargo.available_capacity) - volumetric_weight;
        await cargo.save();
      }

      if (status) {
        return res
          .status(200)
          .json(
            util.helpers.sendSuccess(
              "Shipment booked successfully, the Jetwest team would reach out to to soon."
            )
          );
      }

      return res
        .status(400)
        .json(util.helpers.sendError("Invalid request. Kindly try again"));
    }
  },
};
