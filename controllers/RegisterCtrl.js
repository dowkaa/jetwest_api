"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const utillz = require("../utils/packages");
const db = require("../database/mysql");
const sms = require("../services/sms");
const signToken = (user, token) => {
    var token = utillz.jwt.sign({
        id: user.id,
        email: user.email,
        fullname: user.fullname,
        conpany_name: user.conpany_name,
        phone_number: user.phone_number,
        otp: user.otp,
    }, process.env.SECRET, {
        expiresIn: 1800,
    });
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
    step1: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
                .map((i) => i.message)
                .join(".");
            return res.status(400).json(utillz.helpers.sendError(errorMessage));
        }
        let checkMail = yield utillz.helpers.checkMail(req);
        let checkMobile = yield utillz.helpers.checkMobile(req);
        if (checkMail) {
            return res
                .status(400)
                .json(utillz.helpers.sendError("User with email already exists"));
        }
        if (checkMobile) {
            return res
                .status(400)
                .json(utillz.helpers.sendError("User with mobile number already exists"));
        }
        const { first_name, last_name, country, email, notification_type, otp, password, mobile, } = req.body;
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
        const createUser = yield db.dbs.Users.create({
            customer_id,
            uuid: utillz.uuid(),
            mobile_number: mobile,
            first_name,
            last_name,
            country,
            password: utillz.bcrypt.hashSync(password),
            email,
            otp: otp ? otp : code,
        });
        if (createUser) {
            const option = {
                email: req.body.email,
                name: `${first_name} ${last_name}`,
                message: `Thanks for Jetwest the Jetwest team, we promise to serve your shiping needs. Kindly use the token ${code} to activate your account. 
        Thanks.`,
            };
            yield utillz.helpers.deactivateOtp(email);
            if (notification_type == "email") {
                utillz.welcome.sendMail(option);
            }
            else {
                sms.send(mobile, option.message);
            }
            return res.status(200).json({
                success: {
                    status: "SUCCESS",
                    message: `Kindly verify your email with the code sent to your ${notification_type === "email" ? "email address" : "mobile number"} to verify your registration `,
                },
            });
        }
        else {
            return res.status(400).json(utillz.helpers.sendError("Error occured"));
        }
    }),
    step2: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const schema = utillz.Joi.object()
            .keys({
            otp: utillz.Joi.string().required(),
        })
            .unknown();
        const validate = schema.validate(req.body);
        if (validate.error != null) {
            const errorMessage = validate.error.details
                .map((i) => i.message)
                .join(".");
            return res.status(400).json(utillz.helpers.sendError(errorMessage));
        }
        const { otp } = req.body;
        let user = yield db.dbs.Users.findOne({ where: { otp } });
        if (!user) {
            return res.status(400).json(utillz.helpers.sendError("User not found"));
        }
        if (user.otp != otp) {
            return res
                .status(400)
                .json(utillz.helpers.sendError("Invalid authenication code"));
        }
        user.activated = 1;
        yield user.save();
        return res.status(200).json({
            message: "Your email has been verified successfully",
        });
    }),
    step3: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const schema = utillz.Joi.object()
            .keys({
            organisation: utillz.Joi.string().required(),
            company_name: utillz.Joi.string().required(),
            company_address: utillz.Joi.string().required(),
            companyFounded: utillz.Joi.string().required(),
            type: utillz.Joi.string().required(),
            register_email: utillz.Joi.string(),
        })
            .unknown();
        const validate = schema.validate(req.body);
        if (validate.error != null) {
            const errorMessage = validate.error.details
                .map((i) => i.message)
                .join(".");
            return res.status(400).json(utillz.helpers.sendError(errorMessage));
        }
        const { register_email } = req.body;
        let user = yield db.dbs.Users.findOne({ where: { email: register_email } });
        if (!user) {
            return res.status(400).json(utillz.helpers.sendError("Invalid otp"));
        }
        if (user.company_name) {
            return res
                .status(400)
                .json(utillz.helpers.sendError("Details added already"));
        }
        user.company_name = req.body.company_name;
        user.organisation = req.body.organisation;
        user.company_address = req.body.company_address;
        user.companyFounded = req.body.companyFounded;
        user.type = req.body.type;
        yield user.save();
        return res.status(200).json({
            success: {
                status: "SUCCESS",
            },
        });
    }),
    addBusiness: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const itemSchema = utillz.Joi.object()
            .keys({
            natureOf_biz: utillz.Joi.string().required(),
            business_reg_num: utillz.Joi.string().required(),
            biz_type: utillz.Joi.string().required(),
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
                .map((i) => i.message)
                .join(".");
            return res.status(400).json(utillz.helpers.sendError(errorMessage));
        }
        const { register_email, natureOf_biz, business_reg_num, biz_tax_id, biz_type, country_of_incorporation, incorporation_date, country_of_operation, mobile, email, } = req.body;
        let uuid = utillz.uuid();
        const user = yield db.dbs.Users.findOne({
            where: { email: register_email },
        });
        if (!user) {
            return res
                .status(400)
                .json(utillz.helpers.sendError("Invalid user credential"));
        }
        let checker = yield db.dbs.BusinessCompliance.findOne({
            where: { user_id: user.uuid },
        });
        if (checker) {
            if (checker.status === 3) {
                return res
                    .status(400)
                    .json(utillz.helpers.sendError("Business compliance already updated, kindly add compliance documents"));
            }
            else if (checker.status === 2) {
                return res
                    .status(400)
                    .json(utillz.helpers.sendError("All business compliance data already updated, and under review"));
            }
            return res
                .status(400)
                .json(utillz.helpers.sendError("Business compliance already updated"));
        }
        yield db.dbs.BusinessCompliance.create({
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
        return res.status(200).json({
            success: {
                status: "SUCCESS",
                email,
                message: "business data added successfully",
            },
        });
    }),
    businessDocs: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const itemSchema = utillz.Joi.object()
            .keys({
            incoporation_doc_url: utillz.Joi.string().required(),
            proofOf_biz_address_url: utillz.Joi.string().required(),
            guarantor_form_url: utillz.Joi.string().required(),
            artOf_association: utillz.Joi.string().required(),
            shareHolder_register_url: utillz.Joi.string().required(),
            memorandumOf_guidance_url: utillz.Joi.string().required(),
            email: utillz.Joi.string().required(),
        })
            .unknown();
        const validate1 = itemSchema.validate(req.body);
        if (validate1.error != null) {
            const errorMessage = validate1.error.details
                .map((i) => i.message)
                .join(".");
            return res.status(400).json(utillz.helpers.sendError(errorMessage));
        }
        const { incoporation_doc_url, proofOf_biz_address_url, guarantor_form_url, artOf_association, shareHolder_register_url, memorandumOf_guidance_url, email, } = req.body;
        // let user = await db.dbs.Users.findOne({ where: { email } });
        let business = yield db.dbs.BusinessCompliance.findOne({
            where: { email },
        });
        if (!business) {
            return res
                .status(400)
                .json(utillz.helpers.sendError("Invalid credential passed"));
        }
        if (business.status === 2) {
            return res
                .status(400)
                .json(utillz.helpers.sendError("Compliance document already added, kindly wait for approval for documents provided"));
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
        yield business.save();
        return res
            .status(200)
            .json(utillz.helpers.sendSuccess("Business updated successfully; an email would be sent to your business email when the documents have been reviewed, Thanks."));
    }),
    step4: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const itemSchema = utillz.Joi.object()
            .keys({
            dataArray: utillz.Joi.array().required(),
            register_email: utillz.Joi.string().required(),
        })
            .unknown();
        const validate1 = itemSchema.validate(req.body);
        if (validate1.error != null) {
            const errorMessage = validate1.error.details
                .map((i) => i.message)
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
                .map((i) => i.message)
                .join(".");
            return res.status(400).json(utillz.helpers.sendError(errorMessage));
        }
        const { dataArray, register_email } = req.body;
        const user = yield db.dbs.Users.findOne({
            where: { email: register_email },
        });
        for (const items of dataArray) {
            const { first_name, last_name, title, dob, email, id_url, id_number, address, country, mobile_number, } = items;
            if (!user) {
                return res
                    .status(400)
                    .json(utillz.helpers.sendError("Invalid user credential"));
            }
            yield db.dbs.Directors.create({
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
        let random = utillz.uuid();
        const token = signToken(user, random);
        return res.status(200).json({
            success: {
                status: "SUCCESS",
                token,
                message: "directors data added successfully",
            },
        });
    }),
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
    deleteAccounts: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        let email = req.query.email;
        if (!email) {
            return res.status(400).json(utillz.helpers.sendError("No email added"));
        }
        let user = yield db.dbs.Users.findOne({ where: { email } });
        if (!user) {
            return res
                .status(400)
                .json(utillz.helpers.sendError("No user with this email found"));
        }
        let business = yield db.dbs.BusinessCompliance.findOne({
            where: { user_id: user.uuid },
        });
        let director = yield db.dbs.Directors.findOne({
            where: { user_id: user.uuid },
        });
        let cargo = yield db.dbs.Cargo.findOne({ where: { owner_id: user.uuid } });
        let status = yield db.dbs.ShippingItems.findOne({
            where: { user_id: user.uuid },
        });
        if (business) {
            yield business.destroy();
        }
        if (director) {
            yield director.destroy();
        }
        if (cargo) {
            yield cargo.destroy();
        }
        if (status) {
            yield status.destroy();
        }
        yield user.destroy();
        return res
            .status(200)
            .json(utillz.helpers.sendSuccess("User deleted successfully"));
    }),
};
