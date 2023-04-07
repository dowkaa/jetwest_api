import { Request, Response, NextFunction } from "express";
const util = require("../utils/packages");
const { Op } = require("sequelize");
const db = require("../database/mysql");
const { paginate } = require("paginate-info");

module.exports = {
  getProfile: async (req: any, res: Response, next: NextFunction) => {
    // let res = validateHarsh();
    // console.log({ req: req.headers });
    // let rr = await util.helpers.validateHarsh(
    //   req.headers.api_key,
    //   req.user.uuid
    // );

    // let users = await db.dbs.Users.findOne({
    //   attributes: { exclude: ["id", "password", "otp", "locked", "activated"] },
    //   where: { uuid: req.user.uuid },
    //   include: [
    //     {
    //       model: db.dbs.BusinessCompliance,
    //       as: "business_compliance",
    //     },
    //     {
    //       model: db.dbs.Directors,
    //       as: "directors",
    //     },
    //   ],
    // });

    // console.log({ rr });
    const Directors = await db.dbs.Directors.findAll({
      where: { user_id: { [Op.or]: [req.user.uuid, req.user.id] } },
    });

    let permissions;

    if (req.user.is_Admin === 1) {
      let roles = await db.dbs.Permissions.findOne({
        where: { uuid: req.user.roles },
      });

      permissions = roles;
    }

    let BusinessCompliance = await db.dbs.BusinessCompliance.findOne({
      where: { user_id: { [Op.or]: [req.user.uuid, req.user.id] } },
    });

    let apiKey = await db.dbs.ApiKeys.findOne({
      where: { user_id: { [Op.or]: [req.user.uuid, req.user.id] } },
    });

    const user = {
      uuid: req.user.uuid,
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      customer_id: req.user.customer_id,
      username: req.user.username,
      organisation: req.user.organisation,
      email: req.user.email,
      country: req.user.country,
      mobile_number: req.user.mobile_number,
      company_name: req.user.company_name,
      profileDoc: req.user.profileDoc,
      verification_status: req.user.verification_status,
      company_address: req.user.company_address,
      role_id: req.user.role_id,
      is_Admin: req.user.is_Admin,
      admin_type: req.user.admin_type,
      team_status: req.user.team_id,
      companyFounded: req.user.companyFounded,
      type: req.user.type,
      ratePerKg: req.user.ratePerkg,
      login_status: req.user.reg_status,
      locked: req.user.locked,
      account_type: req.user.is_Admin === 1 ? "Admin" : null,
      activated: req.user.activated,
      permissions,
      BusinessCompliance,
      apiKey: apiKey?.secret,
      Directors,
    };
    return res.status(200).json({ user });
  },

  addCargo: async (req: any, res: Response, next: NextFunction) => {
    const loginSchema = util.Joi.object()
      .keys({
        model: util.Joi.string().required(),
        payload: util.Joi.string().required(),
        areasOfCoverage: util.Joi.string().required(),
        monthly_flight_time: util.Joi.string().required(),
        weekly_flight_time: util.Joi.string().required(),
        daily_flight_time: util.Joi.string().required(),
        aircraft_registration: util.Joi.string().required(),
        airworthiness_cert_url: util.Joi.string().required(),
        airworthiness_cert_exp_date: util.Joi.string().required(),
        noise_cert_url: util.Joi.string().required(),
        noise_cert_exp_date: util.Joi.string().required(),
        insurance_cert_url: util.Joi.string().required(),
        insurance_cert_exp_date: util.Joi.string().required(),
        registration_cert_url: util.Joi.string().required(),
        registration_cert_exp_date: util.Joi.string().required(),
        maintenance_program_url: util.Joi.string().required(),
        mmel: util.Joi.string().required(),
        ops_manual: util.Joi.string().required(),

        // capacity: util.Joi.number().required(),
        // available_capacity: util.Joi.number().required(),
        // take_off: util.Joi.string().required(),
        // geo_coverage: util.Joi.string().required(),
        // //  monthly_flight_time: util.Joi.string().required(),
        // is_available: util.Joi.string().required(),
        // airworthiness_type: util.Joi.string().required(),
        // airworthiness_make: util.Joi.string().required(),
        // airworthiness_model: util.Joi.string().required(),
        // //   airworthiness_cert_url: util.Joi.string().required(),
        // //    aircraft_registration: util.Joi.string().required(),
        // //   airworthiness_cert_exp_date: util.Joi.string().required(),
        // //   noise_cert_url: util.Joi.string().required(),
        // // noise_cert_exp_date: util.Joi.string().required(),
        // //  insurance_cert_url: util.Joi.string().required(),
        // //    insurance_cert_exp_date: util.Joi.string().required(),
        // // registration_cert: util.Joi.string().required(),
        // // registration_cert_exp_date: util.Joi.string().required(),
        // mmel: util.Joi.string().required(),
        // ops_manual: util.Joi.string().required(),
      })
      .unknown();

    const validate = loginSchema.validate(req.body);

    if (validate.error != null) {
      const errorMessage = validate.error.details
        .map((i: any) => i.message)
        .join(".");
      return res.status(400).json(util.helpers.sendError(errorMessage));
    }

    const user = await db.dbs.Users.findOne({ where: { uuid: req.user.uuid } });

    if (user.type !== "Carrier") {
      return res
        .status(400)
        .json(
          util.helpers.sendError(
            "Non carriers are not allowed to add shipments"
          )
        );
    }

    let num = "5N" + "-" + util.helpers.generateClientId(6);

    const {
      model,
      payload,
      areasOfCoverage,
      monthly_flight_time,
      weekly_flight_time,
      daily_flight_time,
      aircraft_registration,
      airworthiness_cert_url,
      airworthiness_cert_exp_date,
      noise_cert_url,
      noise_cert_exp_date,
      insurance_cert_url,
      insurance_cert_exp_date,
      registration_cert_url,
      registration_cert_exp_date,
      maintenance_program_url,
      mmel,
      ops_manual,
    } = req.body;

    let data = await db.dbs.Cargo.create({
      uuid: util.uuid(),
      owner_id: req.user.id,
      model,
      payload,
      areasOfCoverage,
      monthly_flight_time,
      weekly_flight_time,
      flight_reg: aircraft_registration,
      daily_flight_time,
      aircraft_registration,
      airworthiness_cert_url,
      airworthiness_cert_exp_date,
      noise_cert_url,
      noise_cert_exp_date,
      insurance_cert_url,
      insurance_cert_exp_date,
      registration_cert_url,
      registration_cert_exp_date,
      maintenance_program_url,
      mmel,
      status: "pending",
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

    await db.dbs.CustomerAuditLog.create({
      uuid: util.uuid(),
      user_id: req.user.id,
      description: `A user with name ${req.user.first_name} ${req.user.last_name} added a cargo to their cargos list`,
      data: JSON.stringify(req.body),
    });

    return res
      .status(400)
      .json(util.helpers.sendError("Error, kindly try again"));
  },

  myCargos: async (req: any, res: Response, next: NextFunction) => {
    // return res.status(200).json({ cargos });

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

    var cargos = await db.dbs.Cargo.findAndCountAll({
      offset: offset,
      limit: limit,
      where: { owner_id: { [Op.or]: [req.user.uuid, req.user.id] } },
      order: [["id", "DESC"]],
    });

    //1`;

    var next_page = currentPage + 1;
    var prev_page = currentPage - 1;
    var nextP = `/api/jetwest/auth/my-cargos?pageNum=` + next_page;
    var prevP = `/api/jetwest/auth/my-cargos?pageNum=` + prev_page;

    const meta = paginate(currentPage, cargos.count, cargos.rows, pageSize);

    return res.status(200).json({
      status: "SUCCESS",
      data: cargos,
      per_page: pageSize,
      current_page: currentPage,
      last_page: meta.pageCount, //transactions.count,
      first_page_url: `/api/jetwest/auth/my-cargos?pageNum=1`,
      last_page_url: `/api/jetwest/auth/my-cargos?pageNum=` + meta.pageCount, //transactions.count,
      next_page_url: nextP,
      prev_page_url: prevP,
      path: `/api/jetwest/auth/my-cargos?pageNum=`,
      from: 1,
      to: meta.pageCount, //transactions.count,
    });
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
      user_id: req.user.id,
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
        pickup_location: util.Joi.string().required(),
        destination: util.Joi.string().required(),
        total_weight: util.Joi.number().required(),
        stod: util.Joi.string().required(),
        agent_id: util.Joi.string().allow(""),
        reciever_firstname: util.Joi.string().required(),
        reciever_lastname: util.Joi.string().required(),
        reciever_email: util.Joi.string().required(),
        reciever_organisation: util.Joi.string().required(),
        reciever_primaryMobile: util.Joi.string().required(),
        reciever_secMobile: util.Joi.string().allow(""),
        payment_ref: util.Joi.string().allow(""),
        payment_type: util.Joi.string().required(),
        amount: util.Joi.string().allow(""),
        payment_doc_url: util.Joi.string().allow(""),
      })
      .unknown();

    const validate1 = itemSchema.validate(req.body);

    if (validate1.error != null) {
      const errorMessage = validate1.error.details
        .map((i: any) => i.message)
        .join(".");
      return res.status(400).json(util.helpers.sendError(errorMessage));
    }

    const bookingSchema = util.Joi.object()
      .keys({
        type: util.Joi.string().required(),
        depature_date: util.Joi.string().required(),
        shipment_ref: util.Joi.string().required(),
        width: util.Joi.number().required(),
        length: util.Joi.number().required(),
        weight: util.Joi.number().required(),
        height: util.Joi.number().required(),
        invoice_url: util.Joi.array().allow(""),
        category: util.Joi.string().allow(""),
        promo_code: util.Joi.string().allow(""),
        value: util.Joi.number().required(),
        content: util.Joi.string().required(),
        ba_code_url: util.Joi.string().allow(""),
      })
      .unknown();

    const validate = bookingSchema.validate(req.body.items[0]);

    if (validate.error != null) {
      const errorMessage = validate.error.details
        .map((i: any) => i.message)
        .join(".");
      return res.status(400).json(util.helpers.sendError(errorMessage));
    }

    const {
      items,
      pickup_location,
      destination,
      stod,
      total_weight,
      agent_id,
      payment_ref,
      reciever_email,
      reciever_firstname,
      reciever_lastname,
      reciever_organisation,
      reciever_primaryMobile,
      reciever_secMobile,
      payment_type,
      amount,
      payment_doc_url,
    } = req.body;

    let shipment_num = util.helpers.generateReftId(10);
    let scan_code = util.helpers.generateReftId(10);

    if (agent_id) {
      let checker = await db.dbs.Users.findOne({ where: { uuid: agent_id } });

      if (!checker) {
        return res.status(400).json(util.helpers.sendError("Agent not found"));
      }
    }

    let checkShipment = await db.dbs.ShippingItems.findOne({
      where: { shipment_num },
    });

    if (checkShipment) {
      shipment_num = util.helpers.generateReftId(10);
    }

    if (payment_ref) {
      var validateTransaction = await util.helpers.checkUserTransaction(
        payment_ref
      );

      if (validateTransaction) {
        return res
          .status(400)
          .json(util.helpers.sendError("Transaction reference already logged"));
      }
    }

    let payment_methods = ["verto", "paystack", "receipt"];

    if (!payment_methods.includes(payment_type)) {
      return res
        .status(400)
        .json(
          util.helpers.sendError(
            "Kindly use a valid payment method either verto, paystack or receipt"
          )
        );
    }

    let v = await db.dbs.ScheduleFlights.findOne({
      where: {
        departure_station: pickup_location,
        destination_station: destination,
        stod: stod,
      },
    });

    if (!v) {
      return res
        .status(400)
        .json(
          util.helpers.sendError(
            "Flight not available, kindly check up other flights with other stod, or reduce the number of items to be shipped for this flight"
          )
        );
      // if no available flight then save the data to a table for pending luggage and sent mail to admin that will
    }

    if (parseFloat(v.available_capacity) < parseInt(total_weight)) {
      return res
        .status(400)
        .json(
          util.helpers.sendError(
            "Flight not availbale to carry total weight, kindly book another flight or contact customer support"
          )
        );
    }

    if (parseFloat(v.available_capacity) <= 0) {
      return res
        .status(400)
        .json(
          util.helpers.sendError(
            "Flight not availbale to carry total weight, kindly book another flight or contact customer support"
          )
        );
    }

    let arr = JSON.parse(v.departure_date);

    if (!arr.includes(items[0].depature_date)) {
      return res
        .status(400)
        .json(
          util.helpers.sendError(
            `Scheduled flight not available for the departure date entered kindly reschedule for another departure date`
          )
        );
    }

    if (
      Date.parse(items[0].depature_date + " " + stod) - new Date().getTime() <=
      1079999
    ) {
      return res
        .status(400)
        .json(
          util.helpers.sendError(
            "Flight not available for booking, already in transit"
          )
        );
    }

    if (v.status !== "pending") {
      return res
        .status(400)
        .json(util.helpers.sendError("Flight not available"));
    }

    for (const item of items) {
      let price;
      let insurance;
      const {
        type,
        width,
        height,
        weight,
        length,
        shipment_ref,
        category,
        ba_code_url,
        promo_code,
        depature_date,
        value,
        content,
        invoice_url,
      } = item;

      let route = await db.dbs.ShipmentRoutes.findOne({
        where: { destination_name: destination },
      });

      if (!route) {
        return res.status(400).json(util.helpers.sendError("Route not found"));
      }

      let cargo = await db.dbs.Cargo.findOne({
        where: { flight_reg: v.flight_reg },
      });

      if (!cargo) {
        return res
          .status(400)
          .json(
            util.helpers.sendError(
              `Aircraft with flight registration number ${v.flight_reg} not found`
            )
          );
      }

      let chargeable_weight;
      let volumetric_weight =
        (parseInt(width) * parseInt(height) * parseInt(length)) / 5000;

      chargeable_weight =
        volumetric_weight > parseInt(weight)
          ? volumetric_weight
          : parseInt(weight);

      if (category === "fragile") {
        price = chargeable_weight * parseFloat(route.ratePerKg);
        let price1 = price * (parseFloat(route.sur_charge) / 100);
        let price2 = price * (parseFloat(route.tax) / 100);
        let price3 = value * (parseFloat(route.insurance) / 100);
        insurance = price3;
        let totalPrice = price + price1 + price2 + price3;
        price = totalPrice;
      } else {
        price = chargeable_weight * parseFloat(route.ratePerKg);
        let price1 = price * (parseFloat(route.sur_charge) / 100);
        let price2 = price * (parseFloat(route.tax) / 100);
        let totalPrice = price + price1 + price2;
        price = totalPrice;
      }

      if (parseInt(weight) > volumetric_weight) {
        if (parseFloat(v.available_capacity) - parseFloat(weight) < 0) {
          return res
            .status(400)
            .json(
              util.helpers.sendError(
                "Cannot book shipment aircraft capacity not enough"
              )
            );
        }
        v.available_capacity =
          parseFloat(v.available_capacity) - parseFloat(weight);
        v.totalAmount =
          parseFloat(v.totalAmount) +
          price * parseFloat(route.dailyExchangeRate);
        v.taw = parseFloat(v.taw) + parseFloat(weight);
        await v.save();
      } else {
        if (parseFloat(v.available_capacity) - volumetric_weight < 0) {
          return res
            .status(400)
            .json(
              util.helpers.sendError(
                "Cannot book shipment aircraft capacity not enough"
              )
            );
        }

        v.available_capacity =
          parseFloat(v.available_capacity) - parseFloat(weight);
        v.taw = parseFloat(v.taw) + parseFloat(weight);
        v.totalAmount =
          parseFloat(v.totalAmount) +
          price * parseFloat(route.dailyExchangeRate);
        await v.save();
      }

      price = price * parseFloat(route.dailyExchangeRate);

      if (agent_id) {
        let agent = await db.dbs.Users.findOne({ where: { uuid: agent_id } });
        let status = await db.dbs.ShippingItems.create({
          uuid: util.uuid(),
          flight_id: v.id,
          type,
          user_id: req.user.id,
          agent_id: agent.id,
          shipment_num,
          reference: payment_ref,
          value,
          stod: items[0].depature_date + " " + stod,
          pickup_location,
          chargeable_weight,
          cargo_id: cargo.id,
          destination,
          depature_date: depature_date.split("/").reverse().join("-"),
          width,
          length: length,
          height,
          insurance,
          sur_charge: price * (parseFloat(route.sur_charge) / 100),
          taxes: price * (parseFloat(route.tax) / 100),
          booking_type: "Personal",
          status: "pending",
          shipment_routeId: route.id,
          scan_code,
          weight,
          ratePerKg: route.ratePerKg,
          logo_url: v.logo_url,
          arrival_date: v.arrival_date,
          booking_reference: shipment_ref,
          volumetric_weight,
          company_name: req.user.company_name,
          payment_status: "pending",
          shipment_model: "select",
          price: price,
          category,
          ba_code_url,
          promo_code: promo_code ? promo_code : null,
          shipperName: req.user.first_name + " " + req.user.last_name,
          organisation: req.user.organisation,
          shipperNum: req.user.customer_id,
          no_of_bags: items.length,
          content,
          reciever_firstname,
          reciever_lastname,
          reciever_email,
          reciever_organisation,
          reciever_primaryMobile,
          reciever_secMobile,
        });
        if (invoice_url) {
          if (agent_id && invoice_url.length > 0) {
            await db.dbs.ShipmentInvoives.create({
              uuid: util.uuid(),
              user_id: req.user.id,
              invoice_url: JSON.stringify(invoice_url),
              company_name: req.user.company_name,
              shipment_id: status.id,
            });
          }
        }
      } else {
        let status = await db.dbs.ShippingItems.create({
          uuid: util.uuid(),
          flight_id: v.id,
          type,
          user_id: req.user.id,
          shipment_num,
          reference: payment_ref,
          value,
          pickup_location,
          stod: items[0].depature_date + " " + stod,
          chargeable_weight,
          cargo_id: cargo.id,
          destination,
          depature_date: depature_date.split("/").reverse().join("-"),
          width,
          length: length,
          height,
          insurance,
          sur_charge: price * (parseFloat(route.sur_charge) / 100),
          taxes: price * (parseFloat(route.tax) / 100),
          booking_type: "Personal",
          status: "pending",
          shipment_routeId: route.id,
          scan_code,
          weight,
          ratePerKg: route.ratePerKg,
          logo_url: v.logo_url,
          arrival_date: v.arrival_date,
          booking_reference: shipment_ref,
          volumetric_weight,
          company_name: req.user.company_name,
          payment_status: "pending",
          shipment_model: "select",
          price: price,
          category,
          ba_code_url,
          promo_code: promo_code ? promo_code : null,
          shipperName: req.user.first_name + " " + req.user.last_name,
          organisation: req.user.organisation,
          shipperNum: req.user.customer_id,
          no_of_bags: items.length,
          content,
          reciever_firstname,
          reciever_lastname,
          reciever_email,
          reciever_organisation,
          reciever_primaryMobile,
          reciever_secMobile,
        });

        if (invoice_url) {
          if (agent_id && invoice_url.length > 0) {
            await db.dbs.ShipmentInvoives.create({
              uuid: util.uuid(),
              invoice_url: JSON.stringify(invoice_url),
              user_id: req.user.id,
              company_name: req.user.company_name,
              shipment_id: status.id,
            });
          }
        }
      }
    }

    v.no_of_bags = parseInt(v.no_of_bags) + items.length;
    await v.save();

    const option = {
      reference: payment_ref,
      shipment_num,
      id: req.user.id,
      company_name: req.user.company_name,
      amount,
      payment_doc_url,
      user: req.user,
      customer_id: req.user.customer_id,
    };

    if (payment_type === "paystack") {
      if (!payment_ref) {
        return res
          .status(400)
          .json(
            util.helpers.sendError(
              "Kindly add a valid paystack payment reference to validate your payment."
            )
          );
      }
      let response = await util.helpers.validateTransaction(option, "payment");
      util.helpers.checkBaggageConfirmation(option);

      return res.status(200).json(util.helpers.sendSuccess(response));
    } else if (payment_type === "receipt") {
      if (!(payment_doc_url && amount)) {
        return res
          .status(400)
          .json(
            util.helpers.sendError(
              "You need to fill the amount and payment_doc_url if you want to make payment via transfer and reciept upload. "
            )
          );
      }
      util.helpers.paymentForShipmentBookingByReceipt(option);

      return res
        .status(200)
        .json(util.helpers.sendSuccess("Document uploaded successfully"));
    } else {
      return res
        .status(400)
        .json(
          util.helpers.sendError(
            "Payment method not available, kindly proceed to pending payments to payments to make payment"
          )
        );
    }
  },

  trackShipment: async (req: any, res: Response, next: NextFunction) => {
    let ref = req.query.ref;
    let pageNum = req.query.pageNum;

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

    var shipments = await db.dbs.ShippingItems.findAndCountAll({
      offset: offset,
      limit: limit,
      where: {
        [Op.or]: [{ booking_reference: ref }, { shipment_num: ref }],
      },
      order: [["id", "DESC"]],
    });

    var next_page = currentPage + 1;
    var prev_page = currentPage - 1;
    var nextP = "/api/jetwest/auth/trackShipment?pageNum=" + next_page;
    var prevP = "/api/jetwest/auth/trackShipment?pageNum=" + prev_page;

    const meta = paginate(
      currentPage,
      shipments.count,
      shipments.rows,
      pageSize
    );

    return res.status(200).json({
      status: "SUCCESS",
      data: shipments,
      per_page: pageSize,
      current_page: currentPage,
      last_page: meta.pageCount, //transactions.count,
      first_page_url: "/api/jetwest/auth/trackShipment?pageNum=1",
      last_page_url:
        "/api/jetwest/auth/trackShipment?pageNum=" + meta.pageCount, //transactions.count,
      next_page_url: nextP,
      prev_page_url: prevP,
      path: "/api/jetwest/auth/trackShipment",
      from: 1,
      to: meta.pageCount, //transactions.count,
    });
  },

  getAllShipments: async (req: any, res: Response, next: NextFunction) => {
    const { pageNum, shipment_num } = req.query;

    if (!pageNum || isNaN(pageNum) || !shipment_num) {
      return res
        .status(400)
        .json(util.helpers.sendError("Kindly add a valid page number"));
    }

    var currentPage = parseInt(pageNum) ? parseInt(pageNum) : 1;

    var page = currentPage - 1;
    var pageSize = 25;
    const offset = page * pageSize;
    const limit = pageSize;

    var shipments = await db.dbs.ShippingItems.findAndCountAll({
      offset: offset,
      limit: limit,
      where: {
        user_id: { [Op.or]: [req.user.uuid, req.user.id] },
        shipment_num: shipment_num,
      },
      order: [["id", "DESC"]],
    });
    var next_page = currentPage + 1;
    var prev_page = currentPage - 1;
    var nextP =
      `/api/jetwest/auth/all-shipments?shipment_num=${shipment_num}&pageNum=` +
      next_page;
    var prevP =
      `/api/jetwest/auth/all-shipments?shipment_num=${shipment_num}&pageNum=` +
      prev_page;

    const meta = paginate(
      currentPage,
      shipments.count,
      shipments.rows,
      pageSize
    );

    return res.status(200).json({
      status: "SUCCESS",
      data: shipments,
      per_page: pageSize,
      current_page: currentPage,
      last_page: meta.pageCount, //transactions.count,
      first_page_url: `/api/jetwest/auth/all-shipments?shipment_num=${shipment_num}&pageNum=1`,
      last_page_url:
        `/api/jetwest/auth/all-shipments?shipment_num=${shipment_num}&pageNum=` +
        meta.pageCount, //transactions.count,
      next_page_url: nextP,
      prev_page_url: prevP,
      path: `/api/jetwest/auth/all-shipments?shipment_num=${shipment_num}&pageNum=`,
      from: 1,
      to: meta.pageCount, //transactions.count,
    });
  },

  getShipmentItem: async (req: any, res: Response, next: NextFunction) => {
    let booking_reference = req.query.booking_reference;
    if (!booking_reference) {
      return res
        .status(400)
        .json(util.helpers.sendError("Kindly add a valid item"));
    }
    let shipment = await db.dbs.ShippingItems.findAll({
      where: { booking_reference: booking_reference },
    });

    return res.status(200).json({ shipment });
  },

  upcomingShipments: async (req: any, res: Response, next: NextFunction) => {
    // let shipment = await db.dbs.ShippingItems.findAll({
    //   where: { user_id: req.user.uuid, status: "pending" },
    // });

    // return res.status(200).json({ shipment });

    let pageNum = req.query.pageNum;

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

    // const transactions = await db.dbs.User.findAndCountAll({
    //   offset: offset,
    //   limit: limit,
    //   // where: { user_id: req.user.id },
    //   order: [["id", "DESC"]],
    // });

    var shipments = await db.dbs.ShippingItems.findAndCountAll({
      offset: offset,
      limit: limit,
      where: {
        user_id: { [Op.or]: [req.user.uuid, req.user.id] },
        status: "pending",
        payment_status: "SUCCESS",
      },
      order: [["id", "DESC"]],
    });

    var next_page = currentPage + 1;
    var prev_page = currentPage - 1;
    var nextP = "/api/jetwest/auth/upcoming-shipments?pageNum=" + next_page;
    var prevP = "/api/jetwest/auth/upcoming-shipments?pageNum=" + prev_page;

    const meta = paginate(
      currentPage,
      shipments.count,
      shipments.rows,
      pageSize
    );

    // if (meta.pageCount <= currentPage) {
    //   nextP = "api/v-1/@@/transactions?page=" + next_page++;
    //   var prevP = "api/v-1/@@/transactions?page=" + currentPage;
    // }

    // if (meta.pageCount > currentPage) {
    //   nextP = "api/v-1/@@/transactions?page=" + 1;
    //   prev_page = currentPage - 1;
    // }

    return res.status(200).json({
      status: "SUCCESS",
      data: shipments,
      per_page: pageSize,
      current_page: currentPage,
      last_page: meta.pageCount, //transactions.count,
      first_page_url: "/api/jetwest/auth/upcoming-shipments?pageNum=1",
      last_page_url:
        "/api/jetwest/auth/upcoming-shipments?pageNum=" + meta.pageCount, //transactions.count,
      next_page_url: nextP,
      prev_page_url: prevP,
      path: "/api/jetwest/auth/upcoming-shipments",
      from: 1,
      to: meta.pageCount, //transactions.count,
    });
  },

  // search agent shipment by reference
  searchShipment: async (req: any, res: Response, next: NextFunction) => {
    let ref = req.query.ref;
    let pageNum = req.query.pageNum;

    let checker = await db.dbs.Users.findOne({
      where: { uuid: req.user.uuid, type: "Agent" },
    });

    if (!checker) {
      return res
        .status(400)
        .json(util.helpers.sendError("Non agents are not allowed here"));
    }

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

    // const transactions = await db.dbs.User.findAndCountAll({
    //   offset: offset,
    //   limit: limit,
    //   // where: { user_id: req.user.id },
    //   order: [["id", "DESC"]],
    // });

    var shipments = await db.dbs.ShippingItems.findAndCountAll({
      offset: offset,
      limit: limit,
      where: {
        [Op.or]: [{ booking_reference: ref }, { shipment_num: ref }],
      },
      order: [["id", "DESC"]],
    });

    var next_page = currentPage + 1;
    var prev_page = currentPage - 1;
    var nextP = "/api/jetwest/auth/searchShipment?pageNum=" + next_page;
    var prevP = "/api/jetwest/auth/searchShipment?pageNum=" + prev_page;

    const meta = paginate(
      currentPage,
      shipments.count,
      shipments.rows,
      pageSize
    );

    // if (meta.pageCount <= currentPage) {
    //   nextP = "api/v-1/@@/transactions?page=" + next_page++;
    //   var prevP = "api/v-1/@@/transactions?page=" + currentPage;
    // }

    // if (meta.pageCount > currentPage) {
    //   nextP = "api/v-1/@@/transactions?page=" + 1;
    //   prev_page = currentPage - 1;
    // }

    return res.status(200).json({
      status: "SUCCESS",
      data: shipments,
      per_page: pageSize,
      current_page: currentPage,
      last_page: meta.pageCount, //transactions.count,
      first_page_url: "/api/jetwest/auth/searchShipment?pageNum=1",
      last_page_url:
        "/api/jetwest/auth/searchShipment?pageNum=" + meta.pageCount, //transactions.count,
      next_page_url: nextP,
      prev_page_url: prevP,
      path: "/api/jetwest/auth/searchShipment",
      from: 1,
      to: meta.pageCount, //transactions.count,
    });
  },

  // agent shipments enroute
  AgentShipmentEnroute: async (req: any, res: Response, next: NextFunction) => {
    let pageNum = req.query.pageNum;

    let checker = await db.dbs.Users.findOne({
      where: { uuid: req.user.uuid, type: "Agent" },
    });
    if (!checker) {
      return res
        .status(400)
        .json(util.helpers.sendError("Non agents are not allowed here"));
    }

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

    // const transactions = await db.dbs.User.findAndCountAll({
    //   offset: offset,
    //   limit: limit,
    //   // where: { user_id: req.user.id },
    //   order: [["id", "DESC"]],
    // });

    var shipments = await db.dbs.ShippingItems.findAndCountAll({
      offset: offset,
      limit: limit,
      where: {
        agent_id: { [Op.or]: [req.user.uuid, req.user.id] },
        status: "enroute",
      },
      order: [["id", "DESC"]],
    });

    var next_page = currentPage + 1;
    var prev_page = currentPage - 1;
    var nextP =
      "/api/jetwest/auth/agent-shipments-enroute?pageNum=" + next_page;
    var prevP =
      "/api/jetwest/auth/agent-shipments-enroute?pageNum=" + prev_page;

    const meta = paginate(
      currentPage,
      shipments.count,
      shipments.rows,
      pageSize
    );

    // if (meta.pageCount <= currentPage) {
    //   nextP = "api/v-1/@@/transactions?page=" + next_page++;
    //   var prevP = "api/v-1/@@/transactions?page=" + currentPage;
    // }

    // if (meta.pageCount > currentPage) {
    //   nextP = "api/v-1/@@/transactions?page=" + 1;
    //   prev_page = currentPage - 1;
    // }

    return res.status(200).json({
      status: "SUCCESS",
      data: shipments,
      per_page: pageSize,
      current_page: currentPage,
      last_page: meta.pageCount, //transactions.count,
      first_page_url: "/api/jetwest/auth/agent-shipments-enroute?pageNum=1",
      last_page_url:
        "/api/jetwest/auth/agent-shipments-enroute?pageNum=" + meta.pageCount, //transactions.count,
      next_page_url: nextP,
      prev_page_url: prevP,
      path: "/api/jetwest/auth/agent-shipments-enroute",
      from: 1,
      to: meta.pageCount, //transactions.count,
    });
  },

  // upcoming agent shipments
  upcomingAgentShipment: async (
    req: any,
    res: Response,
    next: NextFunction
  ) => {
    let pageNum = req.query.pageNum;

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

    // const transactions = await db.dbs.User.findAndCountAll({
    //   offset: offset,
    //   limit: limit,
    //   // where: { user_id: req.user.id },
    //   order: [["id", "DESC"]],
    // });

    let checker = await db.dbs.Users.findOne({
      where: { uuid: req.user.uuid, type: "Agent" },
    });
    if (!checker) {
      return res
        .status(400)
        .json(util.helpers.sendError("Non agents are not allowed here"));
    }

    var shipments = await db.dbs.ShippingItems.findAndCountAll({
      offset: offset,
      limit: limit,
      where: {
        agent_id: { [Op.or]: [req.user.uuid, req.user.id] },
        status: "pending",
        payment_status: "SUCCESS",
      },
      order: [["id", "DESC"]],
    });

    var next_page = currentPage + 1;
    var prev_page = currentPage - 1;
    var nextP =
      "/api/jetwest/auth/agent-upcoming-shipments?pageNum=" + next_page;
    var prevP =
      "/api/jetwest/auth/agent-upcoming-shipments?pageNum=" + prev_page;

    const meta = paginate(
      currentPage,
      shipments.count,
      shipments.rows,
      pageSize
    );

    // if (meta.pageCount <= currentPage) {
    //   nextP = "api/v-1/@@/transactions?page=" + next_page++;
    //   var prevP = "api/v-1/@@/transactions?page=" + currentPage;
    // }

    // if (meta.pageCount > currentPage) {
    //   nextP = "api/v-1/@@/transactions?page=" + 1;
    //   prev_page = currentPage - 1;
    // }

    return res.status(200).json({
      status: "SUCCESS",
      data: shipments,
      per_page: pageSize,
      current_page: currentPage,
      last_page: meta.pageCount, //transactions.count,
      first_page_url: "/api/jetwest/auth/agent-upcoming-shipments?pageNum=1",
      last_page_url:
        "/api/jetwest/auth/agent-upcoming-shipments?pageNum=" + meta.pageCount, //transactions.count,
      next_page_url: nextP,
      prev_page_url: prevP,
      path: "/api/jetwest/auth/agent-upcoming-shipments",
      from: 1,
      to: meta.pageCount, //transactions.count,
    });
  },

  // completed agent shipments
  completedAgentShipments: async (
    req: any,
    res: Response,
    next: NextFunction
  ) => {
    // let shipments = await db.dbs.ShippingItems.findAll({
    //   where: { agent_id: req.user.uuid, status: "completed" },
    // });

    // return res.status(200).json({ shipments });

    let pageNum = req.query.pageNum;

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

    // const transactions = await db.dbs.User.findAndCountAll({
    //   offset: offset,
    //   limit: limit,
    //   // where: { user_id: req.user.id },
    //   order: [["id", "DESC"]],
    // });

    let checker = await db.dbs.Users.findOne({
      where: { uuid: req.user.uuid, type: "Agent" },
    });
    if (!checker) {
      return res
        .status(400)
        .json(util.helpers.sendError("Non agents are not allowed here"));
    }

    var shipments = await db.dbs.ShippingItems.findAndCountAll({
      offset: offset,
      limit: limit,
      where: {
        agent_id: { [Op.or]: [req.user.uuid, req.user.id] },
        status: "completed",
      },
      order: [["id", "DESC"]],
    });

    var next_page = currentPage + 1;
    var prev_page = currentPage - 1;
    var nextP =
      "/api/jetwest/auth/completed-agent-shipmemts?pageNum=" + next_page;
    var prevP =
      "/api/jetwest/auth/completed-agent-shipmemts?pageNum=" + prev_page;

    const meta = paginate(
      currentPage,
      shipments.count,
      shipments.rows,
      pageSize
    );

    // if (meta.pageCount <= currentPage) {
    //   nextP = "api/v-1/@@/transactions?page=" + next_page++;
    //   var prevP = "api/v-1/@@/transactions?page=" + currentPage;
    // }

    // if (meta.pageCount > currentPage) {
    //   nextP = "api/v-1/@@/transactions?page=" + 1;
    //   prev_page = currentPage - 1;
    // }

    return res.status(200).json({
      status: "SUCCESS",
      data: shipments,
      per_page: pageSize,
      current_page: currentPage,
      last_page: meta.pageCount, //transactions.count,
      first_page_url: "/api/jetwest/auth/completed-agent-shipmemts?pageNum=1",
      last_page_url:
        "/api/jetwest/auth/completed-agent-shipmemts?pageNum=" + meta.pageCount, //transactions.count,
      next_page_url: nextP,
      prev_page_url: prevP,
      path: "/api/jetwest/auth/completed-agent-shipmemts",
      from: 1,
      to: meta.pageCount, //transactions.count,
    });
  },

  updatedShipmentAgent: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const itemSchema = util.Joi.object()
      .keys({
        shipment_id: util.Joi.string().required(),
        agent_id: util.Joi.string().allow(""),
      })
      .unknown();

    const validate1 = itemSchema.validate(req.body);

    if (validate1.error != null) {
      const errorMessage = validate1.error.details
        .map((i: any) => i.message)
        .join(".");
      return res.status(400).json(util.helpers.sendError(errorMessage));
    }

    const { shipment_id, agent_id } = req.body;

    let checker = await db.dbs.ShippingItems.findOne({
      where: { uuid: shipment_id },
    });

    if (!checker) {
      return res.status(400).json(util.helpers.sendError("Shipment not found"));
    }

    checker.agent_id = agent_id;
    await checker.save();

    return res
      .status(200)
      .json(util.helpers.sendSuccess("Agent updated successfully"));
  },
  editShipment: async (req: any, res: Response, next: NextFunction) => {
    const itemSchema = util.Joi.object()
      .keys({
        agent_id: util.Joi.string().allow(""),
        date: util.Joi.string().required(),
        shipment_id: util.Joi.string().required(),
      })
      .unknown();

    const validate1 = itemSchema.validate(req.body);

    if (validate1.error != null) {
      const errorMessage = validate1.error.details
        .map((i: any) => i.message)
        .join(".");
      return res.status(400).json(util.helpers.sendError(errorMessage));
    }

    const { agent_id, date, shipment_id } = req.body;

    let shipment = await db.dbs.ShippingItems.findOne({
      where: { uuid: shipment_id },
    });

    if (!shipment) {
      return res.status(400).json(util.helpers.sendError("Shipment not found"));
    }

    if (shipment.status !== "pending") {
      return res
        .status(400)
        .json(util.helpers.sendError("Operation not allowed"));
    }

    let agent = await db.dbs.Users.findOne({ where: { uuid: agent_id } });

    if (!agent) {
      return res.status(400).json(util.helpers.sendError("Agent not found"));
    }

    let now = Date.now().toString();
    if (shipment.depature_date - Date.parse(now) < 181000000) {
      return res
        .status(400)
        .json(util.helpers.sendError("Operation not allowed"));
    }

    if (agent_id) {
      shipment.depature_date = date;
      shipment.agent_id = agent_id;
      await shipment.save();
    } else {
      shipment.depature_date = date;
      await shipment.save();
    }
    // });

    // if (status) {
    return res
      .status(200)
      .json(util.helpers.sendSuccess("Shipment successfully updated"));
  },

  enRouteShipments: async (req: any, res: Response, next: NextFunction) => {
    // let shipment = await db.dbs.ShippingItems.findAll({
    //   where: { user_id: req.user.uuid, status: "enroute" },
    // });

    // return res.status(200).json({ shipment });

    let pageNum = req.query.pageNum;

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

    // const transactions = await db.dbs.User.findAndCountAll({
    //   offset: offset,
    //   limit: limit,
    //   // where: { user_id: req.user.id },
    //   order: [["id", "DESC"]],
    // });

    var shipments = await db.dbs.ShippingItems.findAndCountAll({
      offset: offset,
      limit: limit,
      where: {
        user_id: { [Op.or]: [req.user.uuid, req.user.id] },
        status: "enroute",
      },
      order: [["id", "DESC"]],
    });

    var next_page = currentPage + 1;
    var prev_page = currentPage - 1;
    var nextP = "/api/jetwest/auth/shipments-enroute?pageNum=" + next_page;
    var prevP = "/api/jetwest/auth/shipments-enroute?pageNum=" + prev_page;

    const meta = paginate(
      currentPage,
      shipments.count,
      shipments.rows,
      pageSize
    );

    // if (meta.pageCount <= currentPage) {
    //   nextP = "api/v-1/@@/transactions?page=" + next_page++;
    //   var prevP = "api/v-1/@@/transactions?page=" + currentPage;
    // }

    // if (meta.pageCount > currentPage) {
    //   nextP = "api/v-1/@@/transactions?page=" + 1;
    //   prev_page = currentPage - 1;
    // }

    return res.status(200).json({
      status: "SUCCESS",
      data: shipments,
      per_page: pageSize,
      current_page: currentPage,
      last_page: meta.pageCount, //transactions.count,
      first_page_url: "/api/jetwest/auth/shipments-enroute?pageNum=1",
      last_page_url:
        "/api/jetwest/auth/shipments-enroute?pageNum=" + meta.pageCount, //transactions.count,
      next_page_url: nextP,
      prev_page_url: prevP,
      path: "/api/jetwest/auth/shipments-enroute?pageNum=",
      from: 1,
      to: meta.pageCount, //transactions.count,
    });
  },

  completedShipments: async (req: any, res: Response, next: NextFunction) => {
    let pageNum = req.query.pageNum;

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

    var shipments = await db.dbs.ShippingItems.findAndCountAll({
      offset: offset,
      limit: limit,
      where: {
        user_id: { [Op.or]: [req.user.uuid, req.user.id] },
        status: "completed",
      },
      order: [["id", "DESC"]],
    });

    var next_page = currentPage + 1;
    var prev_page = currentPage - 1;
    var nextP = "/api/jetwest/auth/completed-shipments?pageNum=" + next_page;
    var prevP = "/api/jetwest/auth/completed-shipments?pageNum=" + prev_page;

    const meta = paginate(
      currentPage,
      shipments.count,
      shipments.rows,
      pageSize
    );

    return res.status(200).json({
      status: "SUCCESS",
      data: shipments,
      per_page: pageSize,
      current_page: currentPage,
      last_page: meta.pageCount, //transactions.count,
      first_page_url: "/api/jetwest/auth/completed-shipments?pageNum=1",
      last_page_url:
        "/api/jetwest/auth/completed-shipments?pageNum=" + meta.pageCount, //transactions.count,
      next_page_url: nextP,
      prev_page_url: prevP,
      path: "/api/jetwest/auth/completed-shipments?pageNum=",
      from: 1,
      to: meta.pageCount, //transactions.count,
    });
  },
  resetPassword: async (req: any, res: Response, next: NextFunction) => {
    // console.log("11111111111111111111111111");
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

      await db.dbs.CustomerAuditLog.create({
        uuid: util.uuid(),
        user_id: user.id,
        description: `A user with name ${user.first_name} ${user.last_name} updated his/her password`,
        data: JSON.stringify(req.body),
      });

      return res
        .status(200)
        .json(util.helpers.sendSuccess("Password updated successfully"));
    }

    return res.status(400).json(util.helpers.sendError("Invalid password"));
  },

  shipmentsFromTransactions: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    let uuid = req.query.uuid;

    if (!uuid) {
      return res
        .status(400)
        .json(util.helpers.sendError("Kindly add a valid transaction id"));
    }

    let transaction = await db.dbs.Transactions.findOne({
      where: { uuid: uuid },
    });

    if (!transaction) {
      return res
        .status(400)
        .json(util.helpers.sendError("Transaction not found"));
    }

    let shipments = await db.dbs.ShippingItems.findAll({
      where: { shipment_num: transaction.shipment_no },
    });

    return res.status(200).json({ shipments });
  },

  getUpdate: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    let user = await db.dbs.Users.findOne({ where: { uuid: req.user.uuid } });

    if (user.type !== "Shipper") {
      return res
        .status(400)
        .json(util.helpers.sendError("Non shippers are not allowed here"));
    }

    var totalCompletedShipments = await db.dbs.ShippingItems.count({
      where: {
        user_id: { [Op.or]: [user.uuid, user.id] },
        status: "completed",
      },
      order: [["id", "DESC"]],
    });

    var totalCancelled = await db.dbs.ShippingItems.count({
      where: {
        user_id: { [Op.or]: [user.uuid, user.id] },
        status: "cancelled",
      },
      order: [["id", "DESC"]],
    });

    const totalSuccessfullTransactionsAmount =
      await db.dbs.Transactions.findAll({
        where: {
          user_id: { [Op.or]: [req.user.customer_id, req.user.id] },
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
      where: { user_id: { [Op.or]: [req.user.uuid, req.user.id] } },
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
        totalCompletedShipments,
        totalSuccessfullTransactionsAmount,
        totalCancelled,
        totalkg,
      },
    });
  },

  pendingPayments: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
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

    let pendingPayments = await db.dbs.Transactions.findAndCountAll({
      where: { user_id: req.user.id },
      offset: offset,
      limit: limit,
      order: [["createdAt", "DESC"]],
    });

    var next_page = currentPage + 1;
    var prev_page = currentPage - 1;
    var nextP = `/api/jetwest/auth/pending-payments?pageNum=` + next_page;
    var prevP = `/api/jetwest/auth/pending-payments?pageNum=` + prev_page;

    const meta = paginate(
      currentPage,
      pendingPayments.count,
      pendingPayments.rows,
      pageSize
    );

    return res.status(200).json({
      status: "SUCCESS",
      data: pendingPayments,
      per_page: pageSize,
      current_page: currentPage,
      last_page: meta.pageCount, //transactions.count,
      first_page_url: `/api/jetwest/auth/pending-payments?pageNum=1`,
      last_page_url:
        `/api/jetwest/auth/pending-payments?pageNum=` + meta.pageCount, //transactions.count,
      next_page_url: nextP,
      prev_page_url: prevP,
      path: `/api/jetwest/auth/pending-payments?pageNum=`,
      from: 1,
      to: meta.pageCount, //transactions.count,
    });
  },

  makePayment: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const itemSchema = util.Joi.object()
      .keys({
        shipment_num: util.Joi.string().required(),
        amount: util.Joi.number().required(),
        reference: util.Joi.string().allow(""),
        method: util.Joi.string().allow(""),
      })
      .unknown();

    const validate1 = itemSchema.validate(req.body);

    if (validate1.error != null) {
      const errorMessage = validate1.error.details
        .map((i: any) => i.message)
        .join(".");
      return res.status(400).json(util.helpers.sendError(errorMessage));
    }

    const { shipment_num, amount, method, reference } = req.body;

    let user = await db.dbs.Users.findOne({ where: { uuid: req.user.uuid } });

    let checker = await db.dbs.Transactions.findOne({
      where: { amount: amount, shipment_no: shipment_num },
    });

    if (!checker) {
      return res
        .status(400)
        .json(util.helpers.sendError("Transaction not found"));
    }

    if (checker.status === "success") {
      return res
        .status(400)
        .json(util.helpers.sendError("payment already verified."));
    } else if (checker.status === "pending_verification") {
      return res
        .status(400)
        .json(
          util.helpers.sendError(
            "Document already uploaded and awaiting verification."
          )
        );
    }

    if (method === "wallet") {
      return res.status(200).json(util.helpers.sendSuccess("coming soon"));
    } else if (method === "paystack") {
      if (!reference) {
        return res
          .status(400)
          .json(util.helpers.sendError("payment reference is required."));
      }
      const option = {
        reference: reference,
        shipment_num,
        id: req.user.id,
        company_name: req.user.company_name,
        customer_id: req.user.customer_id,
      };
      let response = await util.helpers.validateTransaction(
        option,
        "verification"
      );

      await db.dbs.ShippingItems.update(
        { reference: reference },
        {
          where: {
            shipment_num: shipment_num,
          },
        }
      );

      if (response === "success") {
        await db.dbs.CustomerAuditLog.create({
          uuid: util.uuid(),
          user_id: user.id,
          description: `A user with name ${user.first_name} ${user.last_name} uploaded proof of payment for shipment booked by admin customer service with shipment number ${shipment_num}`,
          data: JSON.stringify(req.body),
        });

        return res
          .status(200)
          .json(
            util.helpers.sendSuccess("payment approved successfully Thanks.")
          );
      } else if (response === "exists") {
        return res
          .status(400)
          .json(
            util.helpers.sendError(
              "transaction with reference number already exists"
            )
          );
      } else {
        return res.status(400).json(util.helpers.sendError(response));
      }
    }

    return res
      .status(400)
      .json(util.helpers.sendError("Invalid payment method"));
  },

  addPaymentProof: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const itemSchema = util.Joi.object()
      .keys({
        proof_url: util.Joi.string().required(),
        amount: util.Joi.number().required(),
        shipment_num: util.Joi.string().required(),
      })
      .unknown();

    const validate1 = itemSchema.validate(req.body);

    if (validate1.error != null) {
      const errorMessage = validate1.error.details
        .map((i: any) => i.message)
        .join(".");
      return res.status(400).json(util.helpers.sendError(errorMessage));
    }

    const { proof_url, shipment_num, amount } = req.body;

    let checker = await db.dbs.Transactions.findOne({
      where: { shipment_no: shipment_num },
    });

    if (!checker) {
      return res
        .status(400)
        .json(util.helpers.sendError("Transaction not found"));
    }

    if (checker.status === "success") {
      return res
        .status(400)
        .json(util.helpers.sendError("payment already verified."));
    } else if (checker.status === "pending_verification") {
      return res
        .status(400)
        .json(
          util.helpers.sendError(
            "Document already uploaded and awaiting verification."
          )
        );
    }

    await db.dbs.PaymentProofs.create({
      uuid: util.uuid(),
      user_id: req.user.id,
      proof_url: proof_url,
      shipment_num: shipment_num,
      user_company: req.user.company_name,
      transaction_id: checker.id,
      status: "pending",
      amount: parseFloat(amount),
    });

    checker.status = "pending_verification";
    await checker.save();

    let admin = await db.dbs.Users.findAll({
      where: {
        admin_type: {
          [Op.in]: ["Revenue Officer", "Super Admin"],
        },
      },
    });

    let arr = [];

    for (const ad of admin) {
      arr.push(ad.email);
    }

    const option = {
      name: "Revenue Officer",
      email: arr,
      message:
        "A customer has uploaded a payment document for shipment booked by a customer support admin person on the admin backend. Kindly check through and verify payment",
    };

    try {
      util.paymentValidation.sendMail(option);
    } catch (error: any) {
      console.log({ error });
    }

    let user = await db.dbs.Users.findOne({ where: { uuid: req.user.uuid } });

    await db.dbs.CustomerAuditLog.create({
      uuid: util.uuid(),
      user_id: user.id,
      description: `A user with name ${user.first_name} ${user.last_name} added a proof of payment for shipment booked by admin customer service with shipment number ${shipment_num}`,
      data: JSON.stringify(req.body),
    });

    return res
      .status(200)
      .json(
        util.helpers.sendSuccess(
          "payment successfully added, our customer support would reach you upon payment validation. Thanks."
        )
      );
  },

  viewPaymentProofs: async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const { pageNum, shipment_num } = req.query;

    if (!pageNum || isNaN(pageNum)) {
      return res
        .status(400)
        .json(util.helpers.sendError("Kindly add a valid page number"));
    }

    if (!shipment_num) {
      return res
        .status(400)
        .json(util.helpers.sendError("Kindly add a valid shipment number"));
    }

    var currentPage = parseInt(pageNum) ? parseInt(pageNum) : 1;

    var page = currentPage - 1;
    var pageSize = 25;
    const offset = page * pageSize;
    const limit = pageSize;

    let paymentProof = await db.dbs.PaymentProofs.findAndCountAll({
      offset: offset,
      limit: limit,
      where: { user_id: req.user.id, shipment_num: shipment_num },
      order: [["id", "DESC"]],
    });

    var next_page = currentPage + 1;
    var prev_page = currentPage - 1;
    var nextP = `/api/jetwest/auth/get-payment-proof-docs?pageNum=` + next_page;
    var prevP = `/api/jetwest/auth/get-payment-proof-docs?pageNum=` + prev_page;

    const meta = paginate(
      currentPage,
      paymentProof.count,
      paymentProof.rows,
      pageSize
    );

    return res.status(200).json({
      status: "SUCCESS",
      data: paymentProof,
      per_page: pageSize,
      current_page: currentPage,
      last_page: meta.pageCount, //transactions.count,
      first_page_url: `/api/jetwest/auth/get-payment-proof-docs?pageNum=1`,
      last_page_url:
        `/api/jetwest/auth/get-payment-proof-docs?pageNum=` + meta.pageCount, //transactions.count,
      next_page_url: nextP,
      prev_page_url: prevP,
      path: `/api/jetwest/auth/get-payment-proof-docs?pageNum=`,
      from: 1,
      to: meta.pageCount, //transactions.count,
    });
  },
};
