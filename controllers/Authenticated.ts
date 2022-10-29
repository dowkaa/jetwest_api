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
        first_name: string;
        last_name: string;
        company_name: string;
        mobile_number: string;
        company_address: string;
        companyFounded: string;
        ratePerkg: string;
        country: string;
        state: string;
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
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      customer_id: req.user.customer_id,
      username: req.user.username,
      email: req.user.email,
      country: req.user.country,
      mobile_number: req.user.mobile_number,
      company_name: req.user.company_name,
      company_address: req.user.company_address,
      companyFounded: req.user.companyFounded,
      type: req.user.type,
      ratePerKg: req.user.ratePerkg,
      locked: req.user.locked,
      activated: req.user.activated,
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
        agent_id: util.Joi.string().allow(""),
        reciever_firstname: util.Joi.string().required(),
        reciever_lastname: util.Joi.string().required(),
        reciever_email: util.Joi.string().required(),
        reciver_mobile: util.Joi.string().required(),
        reciever_primaryMobile: util.Joi.string().required(),
        reciever_secMobile: util.Joi.string().required(),
        shipment_num: util.Joi.string().required(),
        routes: util.Joi.string().required(),
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
        shipment_ref: util.Joi.string().required(),
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

    const {
      items,
      agent_id,
      reciever_email,
      reciever_firstname,
      reciever_lastname,
      reciver_mobile,
      reciever_primaryMobile,
      reciever_secMobile,
      shipment_num,
      routes,
    } = req.body;

    console.log({ h: "newcniwepowejmpoew" });

    let checker = await db.dbs.Users.findOne({ where: { uuid: agent_id } });

    console.log("wencijewicojewjij");

    if (!checker) {
      return res.status(400).json(util.helpers.sendError("Agent not found"));
    }

    for (const item of items) {
      let price;
      const {
        type,
        pickup_location,
        destination,
        width,
        height,
        weight,
        length,
        shipment_ref,
        category,
        promo_code,
        depature_date,
        value,
        content,
      } = item;

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

        if (category === "fragile") {
          price =
            chargeable_weight *
            (chargeable_weight * 0.3) *
            req.user.ratePerKg *
            (parseInt(discount) / 100);
        } else {
          price =
            chargeable_weight * req.user.ratePerKg * (parseInt(discount) / 100);
        }
      } else {
        if (category === "fragile") {
          price =
            chargeable_weight * (chargeable_weight * 0.3) * req.user.ratePerKg;
        } else {
          price = chargeable_weight * req.user.ratePerKg;
        }
      }

      // let reference = util.helpers.generateReftId(10);
      let route = await db.dbs.ShipmentRoute.findOne({
        where: { route: routes },
      });

      if (!route) {
        return res.status(400).json(util.helpers.sendError("Route not found"));
      }

      if (parseInt(weight) > volumetric_weight) {
        console.log("112222");

        // if (parseFloat(cargo.available_capacity) - parseFloat(weight) < 0) {
        //   return res
        //     .status(400)
        //     .json(
        //       util.helpers.sendError(
        //         "Cannot book shipment cargo capacity not enough"
        //       )
        //     );
        // }
        // cargo.available_capacity =
        //   parseFloat(cargo.available_capacity) - parseFloat(weight);
        // await cargo.save();
      } else {
        console.log("3334444");
        // if (parseFloat(cargo.available_capacity) - volumetric_weight < 0) {
        //   return res
        //     .status(400)
        //     .json(
        //       util.helpers.sendError(
        //         "Cannot book shipment cargo capacity not enough"
        //       )
        //     );
        // }
        // cargo.available_capacity =
        //   parseFloat(cargo.available_capacity) - volumetric_weight;
        // await cargo.save();
      }

      console.log("jjjjjjjjjjjj");

      let status = await db.dbs.ShippingItems.create({
        uuid: util.uuid(),
        type,
        user_id: req.user.uuid,
        agent_id,
        shipment_num,
        pickup_location,
        destination,
        depature_date,
        width,
        height,
        sur_charge: 10,
        taxes: 10,
        status: "pending",
        shipment_routeId: route.uuid,
        weight,
        booking_reference: shipment_ref,
        volumetric_weight,
        price: price,
        category,
        promo_code: promo_code ? promo_code : null,
        value,
        content,
        reciever_firstname,
        reciever_lastname,
        reciever_email,
        reciver_mobile,
        reciever_primaryMobile,
        reciever_secMobile,
      });
    }

    // if (status) {
    return res
      .status(200)
      .json(
        util.helpers.sendSuccess(
          "Shipment booked successfully, the Jetwest team would reach out to to soon."
        )
      );
    // }
  },

  getAllShipments: async (req: any, res: Response, next: NextFunction) => {
    let shipment_num = req.query.shipment_num;
    if (!shipment_num) {
      return res
        .status(400)
        .json(util.helpers.sendError("Kindly add a valid item"));
    }
    let shipment = await db.dbs.ShippingItems.findAll({
      where: { user_id: req.user.uuid, shipment_num: shipment_num },
    });

    return res.status(200).json({ shipment });
  },

  getShipmentItem: async (req: any, res: Response, next: NextFunction) => {
    let booking_reference = req.query.booking_reference;
    if (!booking_reference) {
      return res
        .status(400)
        .json(util.helpers.sendError("Kindly add a valid item"));
    }
    let shipment = await db.dbs.ShippingItems.findOne({
      where: { user_id: req.user.uuid, booking_reference: booking_reference },
    });

    return res.status(200).json({ shipment });
  },

  upcomingShipments: async (req: any, res: Response, next: NextFunction) => {
    let shipment = await db.dbs.ShippingItems.findAll({
      where: { user_id: req.user.uuid, status: "pending" },
    });

    return res.status(200).json({ shipment });
  },

  enRouteShipments: async (req: any, res: Response, next: NextFunction) => {
    let shipment = await db.dbs.ShippingItems.findAll({
      where: { user_id: req.user.uuid, status: "enroute" },
    });

    return res.status(200).json({ shipment });
  },

  completedShipments: async (req: any, res: Response, next: NextFunction) => {
    let shipment = await db.dbs.ShippingItems.findAll({
      where: { user_id: req.user.uuid, status: "completed" },
    });

    return res.status(200).json({ shipment });
  },
  resetPassword: async (req: any, res: Response, next: NextFunction) => {
    console.log("11111111111111111111111111");
    const loginSchema = util.Joi.object()
      .keys({
        old_password: util.Joi.string().required(),
        new_password: util.Joi.string().required(),
      })
      .unknown();

    const validate = loginSchema.validate(req.body);

    if (validate.error != null) {
      const errorMessage = validate.error.details
        .map((i: any) => i.message)
        .join(".");
      return res.status(400).json(util.helpers.sendError(errorMessage));
    }

    const { old_password, new_password } = req.body;
    let user = await await db.dbs.Users.findOne({
      where: { uuid: req.user.uuid },
    });

    if (util.bcrypt.compareSync(old_password, user.password)) {
      user.password = util.bcrypt.hashSync(new_password);
      await user.save();

      return res
        .status(200)
        .json(util.helpers.sendSuccess("Password updated successfully"));
    }

    return res.status(400).json(util.helpers.sendError("Invalid password"));
  },
};
