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
            email: utillz.Joi.string().required(),
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
        if (checkMail) {
            return res
                .status(400)
                .json(utillz.helpers.sendError("User with email already exists"));
        }
        var code = utillz.helpers.generateClientId(6);
        var customer_id = utillz.helpers.generateClientId(10);
        const createUser = yield db.dbs.Users.create({
            customer_id,
            uuid: utillz.uuid(),
            otp: req.body.otp ? req.body.otp : code,
            email: req.body.email,
        });
        if (createUser) {
            const option = {
                email: req.body.email,
                message: `Thanks for utillz.Joining the Jetwest team, we promise to serve your shiping needs. Kindly use the token ${code} to activate your account. 
        Thanks.`,
            };
            utillz.welcome.sendMail(option);
            return res.status(200).json({
                success: {
                    status: "SUCCESS",
                    message: "Your account was created successfully",
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
        return res
            .status(200)
            .json(utillz.helpers.sendSuccess("Your email has been verified successfully"));
    }),
    step3: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
            type: utillz.Joi.string().required(),
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
        var customer_id = utillz.helpers.generateClientId(10);
        const { otp } = req.body;
        let user = yield db.dbs.Users.findOne({ where: { otp } });
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
        yield user.save();
        return res.status(200).json({
            success: {
                status: "SUCCESS",
            },
        });
    }),
    step4: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const itemSchema = utillz.Joi.object()
            .keys({
            dataArray: utillz.Joi.array().required(),
            otp: utillz.Joi.string().required(),
        })
            .unknown();
        const validate1 = itemSchema.validate(req.body);
        if (validate1.error != null) {
            const errorMessage = validate1.error.details
                .map((i) => i.message)
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
                .map((i) => i.message)
                .join(".");
            return res.status(400).json(utillz.helpers.sendError(errorMessage));
        }
        const { dataArray, otp } = req.body;
        const user = yield db.dbs.Users.findOne({ where: { otp } });
        for (const items of dataArray) {
            const { first_name, last_name, title, dob, email, id_type, id_url, id_number, address, country, state, zip, mobile_number, otp, } = items;
            if (!user) {
                return res
                    .status(400)
                    .json(utillz.helpers.sendError("Invalid user credential"));
            }
            const createCompany = yield db.dbs.Directors.create({
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
    }),
};
