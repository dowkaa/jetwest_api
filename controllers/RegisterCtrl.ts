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
        password: utillz.Joi.string().required(),
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
    let checkMobile = await utillz.helpers.checkMobile(req);

    if (checkMail) {
      return res
        .status(400)
        .json(utillz.helpers.sendError("User with email already exists"));
    }

    if (checkMobile) {
      return res
        .status(400)
        .json(
          utillz.helpers.sendError("User with mobile number already exists")
        );
    }

    const {
      first_name,
      last_name,
      country,
      email,
      notification_type,
      otp,
      password,
      mobile,
    } = req.body;

    if (!email.includes("@")) {
      return res
        .status(400)
        .json(utillz.helpers.sendError("Kindly enter a valid email address"));
    }

    if (/[a-zA-Z]/.test(mobile)) {
      return res
        .status(400)
        .json(utillz.helpers.sendError("Kindly enter a valid mobile number"));
    }

    var code = utillz.helpers.generateClientId(6);
    var customer_id = utillz.helpers.generateClientId(10);

    const createUser = await db.dbs.Users.create({
      customer_id,
      uuid: utillz.uuid(),
      mobile_number: mobile,
      first_name,
      last_name,
      reg_status: "step-1",
      country,
      password: utillz.bcrypt.hashSync(password),
      email,
      otp: otp ? otp : code,
    });

    if (createUser) {
      const option = {
        email: req.body.email,
        name: `${first_name} ${last_name}`,
        message: `Thanks for joing the Dowkaa team, we promise to serve your shiping needs. Kindly use the token ${code} to activate your account. Thanks.`,
        otp: code,
      };

      if (notification_type == "email") {
        utillz.welcome.sendMail(option);
        utillz.verify.sendMail(option);
      } else {
        sms.send(mobile, option.message);
        utillz.welcome.sendMail(option);
      }

      utillz.helpers.deactivateOtp(email);

      return res.status(200).json({
        success: {
          status: "SUCCESS",
          otp: code,
          message: `Kindly verify your email with the code sent to your ${
            notification_type === "email" ? "email address" : "mobile number"
          } `,
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
      return res
        .status(400)
        .json(
          utillz.helpers.sendError(
            "Otp expired or invalid, kindly request for another otp. Thanks."
          )
        );
    }

    if (user.otp != otp) {
      return res
        .status(400)
        .json(utillz.helpers.sendError("Invalid authenication code"));
    }

    await user.save();
    user.reg_status = "step-2";
    user.activated = 1;
    await user.save();
    const option = {
      name: `${user.first_name} ${user.last_name}`,
      email: user.email,
    };
    utillz.verifySuccess.sendMail(option);

    let random = utillz.uuid();

    const token = signToken(user, random);

    return res.status(200).json({
      success: {
        status: "SUCCESS",
        email: user.email,
        account_type: user.type,
        token,
        message: "Your email has been verified successfully",
        totalCompletedShipments: 0,
        totalAmount: [
          {
            total_amount: 0,
          },
        ],
        totalCancelled: 0,
        totalkg: [
          {
            totalKg: 0,
          },
        ],
      },
    });
  },

  step3: async (req: Request, res: Response, next: NextFunction) => {
    const schema = utillz.Joi.object()
      .keys({
        organisation: utillz.Joi.string().required(),
        profileDoc: utillz.Joi.string().required(),
        company_name: utillz.Joi.string().required(),
        company_address: utillz.Joi.string().required(),
        companyFounded: utillz.Joi.string().required(),
        type: utillz.Joi.string().required(), // Agent, Carriers, Shippers
        airport: utillz.Joi.string().allow(""),
        register_email: utillz.Joi.string(),
      })
      .unknown();

    const validate = schema.validate(req.body);

    if (validate.error != null) {
      const errorMessage = validate.error.details
        .map((i: any) => i.message)
        .join(".");
      return res.status(400).json(utillz.helpers.sendError(errorMessage));
    }

    const { register_email } = req.body;

    let user = await db.dbs.Users.findOne({ where: { email: register_email } });

    if (!user) {
      return res.status(400).json(utillz.helpers.sendError("Invalid otp"));
    }

    if (user.company_name) {
      return res
        .status(400)
        .json(utillz.helpers.sendError("Details added already"));
    }

    if (req.body.type === "Agent") {
      if (!req.body.airport) {
        return res
          .status(400)
          .json(utillz.helpers.sendError("Kindly add airport for Agent"));
      }

      user.airport = req.body.airport;
      await user.save();
    }

    user.company_name = req.body.company_name;
    user.organisation = req.body.organisation;
    user.profileDoc = req.body.profileDoc;
    user.reg_status = "step-3";
    user.company_address = req.body.company_address;
    user.companyFounded = req.body.companyFounded;
    user.type = req.body.type;
    await user.save();

    return res.status(200).json({
      success: {
        status: "SUCCESS",
        email: user.email,
        account_type: user.type,
      },
    });
  },

  addBusiness: async (req: Request, res: Response, next: NextFunction) => {
    const itemSchema = utillz.Joi.object()
      .keys({
        natureOf_biz: utillz.Joi.string().required(),
        business_reg_num: utillz.Joi.string().required(),
        biz_type: utillz.Joi.string().allow(""),
        biz_tax_id: utillz.Joi.string().required(),
        country_of_incorporation: utillz.Joi.string().required(),
        incorporation_date: utillz.Joi.string().required(),
        country_of_operation: utillz.Joi.string().required(),
        mobile: utillz.Joi.string().required(),
        email: utillz.Joi.string().required(),
        register_email: utillz.Joi.string().required(),
      })
      .unknown();

    const validate1 = itemSchema.validate(req.body);

    if (validate1.error != null) {
      const errorMessage = validate1.error.details
        .map((i: any) => i.message)
        .join(".");
      return res.status(400).json(utillz.helpers.sendError(errorMessage));
    }

    const {
      register_email,
      natureOf_biz,
      business_reg_num,
      biz_tax_id,
      biz_type,
      country_of_incorporation,
      incorporation_date,
      country_of_operation,
      mobile,
      email,
    } = req.body;

    let uuid = utillz.uuid();

    const user = await db.dbs.Users.findOne({
      where: { email: register_email },
    });

    if (!user) {
      return res
        .status(400)
        .json(utillz.helpers.sendError("Invalid user credential"));
    }

    let checker = await db.dbs.BusinessCompliance.findOne({
      where: { user_id: user.uuid },
    });

    if (checker) {
      if (checker.status === 3) {
        return res
          .status(400)
          .json(
            utillz.helpers.sendError(
              "Business compliance already updated, kindly add compliance documents"
            )
          );
      } else if (checker.status === 2) {
        return res
          .status(400)
          .json(
            utillz.helpers.sendError(
              "All business compliance data already updated, and under review"
            )
          );
      }
      return res
        .status(400)
        .json(utillz.helpers.sendError("Business compliance already updated"));
    }

    await db.dbs.BusinessCompliance.create({
      uuid: uuid,
      user_id: user.uuid,
      natureOf_biz,
      business_reg_num,
      biz_type,
      biz_tax_id,
      country_of_incorporation,
      incorporation_date,
      country_of_operation,
      mobile,
      email,
      status: 3,
    });
    user.reg_status = "step-4";
    await user.save();

    return res.status(200).json({
      success: {
        status: "SUCCESS",
        email: user.email,
        account_type: user.type,
        message: "business data added successfully",
      },
    });
  },

  step4: async (req: Request, res: Response, next: NextFunction) => {
    const itemSchema = utillz.Joi.object()
      .keys({
        dataArray: utillz.Joi.array().required(),
        register_email: utillz.Joi.string().required(),
      })
      .unknown();

    const validate1 = itemSchema.validate(req.body);

    if (validate1.error != null) {
      const errorMessage = validate1.error.details
        .map((i: any) => i.message)
        .join(".");
      return res.status(400).json(utillz.helpers.sendError(errorMessage));
    }

    const schema = utillz.Joi.object()
      .keys({
        title: utillz.Joi.string().required(),
        first_name: utillz.Joi.string().required(),
        last_name: utillz.Joi.string().required(),
        dob: utillz.Joi.string().required(),
        email: utillz.Joi.string().required(),
        id_number: utillz.Joi.string().required(),
        id_url: utillz.Joi.string().required(),
        address: utillz.Joi.string().required(),
        country: utillz.Joi.string().required(),
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

    const { dataArray, register_email } = req.body;

    const user = await db.dbs.Users.findOne({
      where: { email: register_email },
    });

    for (const items of dataArray) {
      const {
        first_name,
        last_name,
        title,
        dob,
        email,
        id_url,
        id_number,
        address,
        country,
        mobile_number,
      } = items;

      if (!user) {
        return res
          .status(400)
          .json(utillz.helpers.sendError("Invalid user credential"));
      }

      await db.dbs.Directors.create({
        uuid: utillz.uuid(),
        user_id: user.uuid,
        first_name,
        last_name,
        title,
        dob,
        email,
        director_owner_id_url: id_url,
        id_number,
        address,
        country,
        mobile_number,
      });
    }

    user.reg_status = "step-5";
    await user.save();

    let random = utillz.uuid();

    const token = signToken(user, random);

    if (user.type === "Carrier" || user.type === "Shipper") {
      return res.status(200).json({
        success: {
          status: "SUCCESS",
          token,
          email: user.email,
          account_type: user.type,
          message: "directors data added successfully",
          totalCompletedShipments: 0,
          totalAmount: [
            {
              total_amount: 0,
            },
          ],
          totalCancelled: 0,
          totalkg: [
            {
              totalKg: 0,
            },
          ],
        },
      });
    } else {
      return res.status(200).json({
        success: {
          status: "SUCCESS",
          token,
          email: user.email,
          account_type: user.type,
          message: "directors data added successfully",
        },
      });
    }
  },

  businessDocs: async (req: Request, res: Response, next: NextFunction) => {
    const itemSchema = utillz.Joi.object()
      .keys({
        incoporation_doc_url: utillz.Joi.string().required(),
        proofOf_biz_address_url: utillz.Joi.string().required(),
        guarantor_form_url: utillz.Joi.string().required(),
        artOf_association: utillz.Joi.string().required(),
        shareHolder_register_url: utillz.Joi.string().required(),
        memorandumOf_guidance_url: utillz.Joi.string().required(),
        register_email: utillz.Joi.string().required(),
      })
      .unknown();

    const validate1 = itemSchema.validate(req.body);

    if (validate1.error != null) {
      const errorMessage = validate1.error.details
        .map((i: any) => i.message)
        .join(".");
      return res.status(400).json(utillz.helpers.sendError(errorMessage));
    }

    const {
      incoporation_doc_url,
      proofOf_biz_address_url,
      guarantor_form_url,
      artOf_association,
      shareHolder_register_url,
      register_email,
      memorandumOf_guidance_url,
    } = req.body;

    let user = await db.dbs.Users.findOne({ where: { email: register_email } });

    if (!user) {
      return res
        .status(400)
        .json(utillz.helpers.sendError("Invalid user credential"));
    }

    let business = await db.dbs.BusinessCompliance.findOne({
      where: { user_id: user.uuid },
    });

    if (!business) {
      return res
        .status(400)
        .json(utillz.helpers.sendError("Invalid credential passed"));
    }

    if (business.status === 2) {
      return res
        .status(400)
        .json(
          utillz.helpers.sendError(
            "Compliance document already added, kindly wait for approval for documents provided"
          )
        );
    }

    business.incoporation_doc_url = incoporation_doc_url;
    business.incoporation_doc_url_status = "pending";
    business.proofOf_biz_address_url = proofOf_biz_address_url;
    business.proofOf_biz_address_url_status = "pending";
    business.guarantor_form_url = guarantor_form_url;
    business.guarantor_form_url_status = "pending";
    business.artOf_association_url = artOf_association;
    business.artOf_association_status = "pending";
    business.shareHolder_register_url = shareHolder_register_url;
    business.shareHolder_register_url_status = "pending";
    business.memorandumOf_guidance_url = memorandumOf_guidance_url;
    business.memorandumOf_guidance_url_status = "pending";
    business.status = 2;
    await business.save();
    user.reg_status = "completed";
    user.verification_status = "In progress";
    await user.save();

    return res
      .status(200)
      .json(
        utillz.helpers.sendSuccess(
          "Business updated successfully; an email would be sent to your business email when the documents have been reviewed, Thanks."
        )
      );
  },

  // resendRegistrationOtp: async (req: any, res: any, next: any) => {
  //   let email = req.query.email;

  //   if (!email) {
  //     return res.status(400).json(utillz.helpers.sendError("No email added"));
  //   }

  //   let user = await db.dbs.Users.findOne({ where: { email } });
  //   if (!user) {
  //     return res
  //       .status(400)
  //       .json(utillz.helpers.sendError("No user with this email found"));
  //   }

  //   var code = utillz.helpers.generateClientId(6);

  //   user.otp = code;
  //   await user.save();

  //   await utillz.helpers.deactivateOtp(email);

  //   return res
  //     .status(200)
  //     .json(utillz.helpers.sendSuccess("otp sent successfully"));
  // },

  deleteAccounts: async (req: any, res: any, next: any) => {
    let email = req.query.email;

    if (!email) {
      return res.status(400).json(utillz.helpers.sendError("No email added"));
    }

    let user = await db.dbs.Users.findOne({ where: { email: email } });
    if (!user) {
      return res
        .status(400)
        .json(utillz.helpers.sendError("No user with this email found"));
    }

    let business = await db.dbs.BusinessCompliance.findOne({
      where: { user_id: user.uuid },
    });
    let director = await db.dbs.Directors.findOne({
      where: { user_id: user.uuid },
    });
    let cargo = await db.dbs.Cargo.findOne({ where: { owner_id: user.uuid } });
    let status = await db.dbs.ShippingItems.findOne({
      where: { user_id: user.uuid },
    });

    if (business) {
      await business.destroy();
    }

    if (director) {
      await director.destroy();
    }

    if (cargo) {
      await cargo.destroy();
    }

    if (status) {
      await status.destroy();
    }

    await user.destroy();
    return res
      .status(200)
      .json(utillz.helpers.sendSuccess("User deleted successfully"));
  },

  updateAccount: async (req: any, res: Response, next: NextFunction) => {
    const { account_type, registered_email } = req.query;

    if (!account_type && !registered_email) {
      return res
        .status(400)
        .json(utillz.helpers.sendError("Enter valid query parameters"));
    }

    let user = await db.dbs.Users.findOne({
      where: { email: registered_email },
    });

    if (!user) {
      return res
        .status(400)
        .json(utillz.helpers.sendError("No user with this email found"));
    }

    user.type = account_type;
    await user.save();

    return res
      .status(200)
      .json(utillz.helpers.sendSuccess("Account type updated successfully"));
  },
};
