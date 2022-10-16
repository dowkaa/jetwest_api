require("dotenv").config();
import { Request, Response, NextFunction } from "express";
const utillz = require("../utils/packages");
const db = require("../database/mysql");
const sms = require("../services/sms");

const signToken = (user: any, token: string) => {
  var token: string = utillz.jwt.sign(
    {
      id: user.id,
      email: user.email,
      fullname: user.fullname,
      conpany_name: user.conpany_name,
      phone_number: user.phone_number,
      otp: user.otp,
    },
    process.env.SECRET,
    {
      expiresIn: 1800,
    }
  );
  var decoded = utillz.jwt_decode(token);
  db.dbs.Oauth.create(decoded);
  return token;
};

// interface TypedRequestBody<T> extends Express.Request {
//   body: T;
// }

// export interface TypedRequestBody<T extends Query, U> extends Express.Request {
//   body: U;
//   query: T;
// }

// interface TypedResponse<ResBody> extends Express.Response {
//   json: Send<ResBody, this>;
// }

module.exports = {
  step1: async (req: Request, res: Response, next: NextFunction) => {
    const schema = utillz.Joi.object()
      .keys({
        first_name: utillz.Joi.string().required(),
        last_name: utillz.Joi.string().required(),
        country: utillz.Joi.string().required(),
        email: utillz.Joi.string().required(),
        notification_type: utillz.Joi.string().required(),
        mobile: utillz.Joi.string().required(),
        otp: utillz.Joi.string(),
      })
      .unknown();

    const validate = schema.validate(req.body);

    if (validate.error != null) {
      const errorMessage = validate.error.details
        .map((i: any) => i.message)
        .join(".");
      return res.status(400).json(utillz.helpers.sendError(errorMessage));
    }

    let checkMail = await utillz.helpers.checkMail(req);

    if (checkMail) {
      return res
        .status(400)
        .json(utillz.helpers.sendError("User with email already exists"));
    }

    const {
      first_name,
      last_name,
      country,
      email,
      notification_type,
      otp,
      mobile,
    } = req.body;

    var code = utillz.helpers.generateClientId(6);
    var customer_id = utillz.helpers.generateClientId(10);

    const createUser = await db.dbs.Users.create({
      customer_id,
      uuid: utillz.uuid(),
      mobile_number: mobile,
      first_name,
      last_name,
      country,
      email,
      otp: req.body.otp ? req.body.otp : code,
    });

    if (createUser) {
      const option = {
        email: req.body.email,
        message: `Thanks for utillz.Joining the Jetwest team, we promise to serve your shiping needs. Kindly use the token ${code} to activate your account. 
        Thanks.`,
      };

      if (notification_type == "email") {
        utillz.welcome.sendMail(option);
      } else {
        sms.send(mobile, option.message);
      }

      return res.status(200).json({
        success: {
          status: "SUCCESS",
          message: "Your account was created successfully",
        },
      });
    } else {
      return res.status(400).json(utillz.helpers.sendError("Error occured"));
    }
  },

  step2: async (req: Request, res: Response, next: NextFunction) => {
    const schema = utillz.Joi.object()
      .keys({
        otp: utillz.Joi.string().required(),
      })
      .unknown();

    const validate = schema.validate(req.body);

    if (validate.error != null) {
      const errorMessage = validate.error.details
        .map((i: any) => i.message)
        .join(".");
      return res.status(400).json(utillz.helpers.sendError(errorMessage));
    }

    const { otp } = req.body;

    let user = await db.dbs.Users.findOne({ where: { otp } });

    if (!user) {
      return res.status(400).json(utillz.helpers.sendError("User not found"));
    }

    if (user.otp != otp) {
      return res
        .status(400)
        .json(utillz.helpers.sendError("Invalid authenication code"));
    }

    user.activated = 1;
    await user.save();

    return res
      .status(200)
      .json(
        utillz.helpers.sendSuccess("Your email has been verified successfully")
      );
  },

  step3: async (req: Request, res: Response, next: NextFunction) => {
    const schema = utillz.Joi.object()
      .keys({
        company_name: utillz.Joi.string().required(),
        company_address: utillz.Joi.string().required(),
        companyFounded: utillz.Joi.string().required(),
        country: utillz.Joi.string().required(),
        nature_of_business: utillz.Joi.string().required(),
        business_reg_number: utillz.Joi.string().required(),
        taxId_vat_number: utillz.Joi.string().required(),
        password: utillz.Joi.string().required(),
        mobile_number: utillz.Joi.string().required(),
        business_country: utillz.Joi.string().required(),
        type: utillz.Joi.string().required(), // Agent, Carriers, Shippers
        otp: utillz.Joi.string(),
      })
      .unknown();

    const validate = schema.validate(req.body);

    if (validate.error != null) {
      const errorMessage = validate.error.details
        .map((i: any) => i.message)
        .join(".");
      return res.status(400).json(utillz.helpers.sendError(errorMessage));
    }

    var customer_id = utillz.helpers.generateClientId(10);

    const { otp } = req.body;

    let user = await db.dbs.Users.findOne({ where: { otp } });

    if (!user) {
      return res.status(400).json(utillz.helpers.sendError("Invalid otp"));
    }

    if (user.company_name) {
      return res
        .status(400)
        .json(utillz.helpers.sendError("Details added already"));
    }

    // const createUser = await db.dbs.Users.create({
    user.customer_id = customer_id;
    user.company_name = req.body.company_name;
    user.company_address = req.body.company_address;
    user.companyFounded = req.body.companyFounded;
    user.country = req.body.country;
    user.nature_of_business = req.body.nature_of_business;
    user.business_reg_number = req.body.business_reg_number;
    user.taxId_vat_number = req.body.taxId_vat_number;
    user.mobile_number = req.body.mobile_number;
    user.business_country = req.body.business_country;
    user.type = req.body.type;
    user.password = utillz.bcrypt.hashSync(req.body.password);
    await user.save();

    return res.status(200).json({
      success: {
        status: "SUCCESS",
      },
    });
  },

  step4: async (req: Request, res: Response, next: NextFunction) => {
    const itemSchema = utillz.Joi.object()
      .keys({
        dataArray: utillz.Joi.array().required(),
        otp: utillz.Joi.string().required(),
      })
      .unknown();

    const validate1 = itemSchema.validate(req.body);

    if (validate1.error != null) {
      const errorMessage = validate1.error.details
        .map((i: any) => i.message)
        .Join(".");
      return res.status(400).json(utillz.helpers.sendError(errorMessage));
    }

    const schema = utillz.Joi.object()
      .keys({
        first_name: utillz.Joi.string().required(),
        last_name: utillz.Joi.string().required(),
        title: utillz.Joi.string().required(),
        dob: utillz.Joi.string().required(),
        email: utillz.Joi.string().required(),
        id_number: utillz.Joi.string().required(),
        id_type: utillz.Joi.string().required(),
        id_url: utillz.Joi.string().required(),
        address: utillz.Joi.string().required(),
        country: utillz.Joi.string().required(),
        state: utillz.Joi.string().required(),
        zip: utillz.Joi.string().required(),
        mobile_number: utillz.Joi.string().required(),
      })
      .unknown();

    const validate = schema.validate(req.body.dataArray[0]);

    if (validate.error != null) {
      const errorMessage = validate.error.details
        .map((i: any) => i.message)
        .join(".");
      return res.status(400).json(utillz.helpers.sendError(errorMessage));
    }

    const { dataArray, otp } = req.body;

    const user = await db.dbs.Users.findOne({ where: { otp } });

    for (const items of dataArray) {
      const {
        first_name,
        last_name,
        title,
        dob,
        email,
        id_type,
        id_url,
        id_number,
        address,
        country,
        state,
        zip,
        mobile_number,
        otp,
      } = items;

      if (!user) {
        return res
          .status(400)
          .json(utillz.helpers.sendError("Invalid user credential"));
      }

      const createCompany = await db.dbs.Directors.create({
        uuid: utillz.uuid(),
        user_id: user.uuid,
        first_name,
        last_name,
        title,
        dob,
        email,
        id_type,
        id_url,
        id_number,
        address,
        country,
        state,
        zip,
        mobile_number,
      });

      if (createCompany) {
        let random = utillz.uuid();

        const token = signToken(user, random);

        return res.status(200).json({
          success: {
            status: "SUCCESS",
            token,
            message: "Your account was created successfully",
          },
        });
      }
    }
  },
};
