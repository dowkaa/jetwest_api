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
const utills = require("../utils/packages");
const signToken = (user, token) => {
    var token = utills.jwt.sign({
        id: user.id,
        email: user.email,
        fullname: user.fullname,
        conpany_name: user.conpany_name,
        phone_number: user.phone_number,
        otp: user.otp,
    }, process.env.SECRET, {
        expiresIn: 1800,
    });
    var decoded = utills.jwt_decode(token);
    utills.db.Oauth.create(decoded);
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
        const schema = utills.Joi.object()
            .keys({
            email: utills.Joi.string().required(),
            otp: utills.Joi.string(),
        })
            .unknown();
        const validate = schema.validate(req.body);
        if (validate.error != null) {
            const errorMessage = validate.error.details
                .map((i) => i.message)
                .utills.Join(".");
            return res.status(400).json(utills.helpers.sendError(errorMessage));
        }
        let checkMail = yield utills.helpers.checkMail(req);
        if (checkMail) {
            return res
                .status(400)
                .json(utills.helpers.sendError("User with email already exists"));
        }
        var code = utills.helpers.generateClientId(6);
        var customer_id = utills.helpers.generateClientId(10);
        const createUser = yield utills.db.Users.create({
            customer_id,
            uuid: utills.uuid(),
            otp: req.body.otp ? req.body.otp : code,
            email: req.body.email,
        });
        if (createUser) {
            const option = {
                email: req.body.email,
                message: `Thanks for utills.Joining the Jetwest team, we promise to serve your shiping needs. Kindly use the token ${code} to activate your account. 
        Thanks.`,
            };
            utills.welcome.sendMail(option);
            return res.status(200).json({
                success: {
                    status: "SUCCESS",
                    message: "Your account was created successfully",
                },
            });
        }
        else {
            return res.status(400).json(utills.helpers.sendError("Error occured"));
        }
    }),
    step2: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const schema = utills.Joi.object()
            .keys({
            otp: utills.Joi.string().required(),
        })
            .unknown();
        const validate = schema.validate(req.body);
        if (validate.error != null) {
            const errorMessage = validate.error.details
                .map((i) => i.message)
                .utills.Join(".");
            return res.status(400).json(utills.helpers.sendError(errorMessage));
        }
        const { otp } = req.body;
        let user = yield utills.db.Users.findOne({ where: { otp } });
        if (!user) {
            return res.status(400).json(utills.helpers.sendError("User not found"));
        }
        if (user.otp != otp) {
            return res
                .status(400)
                .json(utills.helpers.sendError("Invalid authenication code"));
        }
        user.activated = 1;
        yield user.save();
        return res
            .status(200)
            .json(utills.helpers.sendSuccess("Your email has been verified successfully"));
    }),
    step3: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const schema = utills.Joi.object()
            .keys({
            company_name: utills.Joi.string().required(),
            company_address: utills.Joi.string().required(),
            companyFounded: utills.Joi.string().required(),
            country: utills.Joi.string().required(),
            nature_of_business: utills.Joi.string().required(),
            business_reg_number: utills.Joi.string().required(),
            taxId_vat_number: utills.Joi.string().required(),
            password: utills.Joi.string().required(),
            mobile_number: utills.Joi.string().required(),
            business_country: utills.Joi.string().required(),
            type: utills.Joi.string().required(),
            otp: utills.Joi.string(),
        })
            .unknown();
        const validate = schema.validate(req.body);
        if (validate.error != null) {
            const errorMessage = validate.error.details
                .map((i) => i.message)
                .utills.Join(".");
            return res.status(400).json(utills.helpers.sendError(errorMessage));
        }
        var customer_id = utills.helpers.generateClientId(10);
        const { otp } = req.body;
        let user = yield utills.db.Users.findOne({ where: { otp } });
        if (!user) {
            return res.status(400).json(utills.helpers.sendError("Invalid otp"));
        }
        if (user.company_name) {
            return res
                .status(400)
                .json(utills.helpers.sendError("Details added already"));
        }
        // const createUser = await utills.db.Users.create({
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
        user.password = utills.bcrypt.hashSync(req.body.password);
        yield user.save();
        return res.status(200).json({
            success: {
                status: "SUCCESS",
            },
        });
    }),
    step4: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const itemSchema = utills.Joi.object()
            .keys({
            dataArray: utills.Joi.array().required(),
        })
            .unknown();
        const validate1 = itemSchema.validate(req.body);
        if (validate1.error != null) {
            const errorMessage = validate1.error.details
                .map((i) => i.message)
                .Join(".");
            return res.status(400).json(utills.helpers.sendError(errorMessage));
        }
        const schema = utills.Joi.object()
            .keys({
            first_name: utills.Joi.string().required(),
            lastname_name: utills.Joi.string().required(),
            title: utills.Joi.string().required(),
            dob: utills.Joi.string().required(),
            email: utills.Joi.string().required(),
            id_number: utills.Joi.string().required(),
            address: utills.Joi.string().required(),
            country: utills.Joi.string().required(),
            state: utills.Joi.string().required(),
            zip: utills.Joi.string().required(),
            mobile_number: utills.Joi.string().required(),
            otp: utills.Joi.string().required(),
        })
            .unknown();
        const validate = schema.validate(req.body.dataArray[0]);
        if (validate.error != null) {
            const errorMessage = validate.error.details
                .map((i) => i.message)
                .utills.Join(".");
            return res.status(400).json(utills.helpers.sendError(errorMessage));
        }
        const { first_name, lastname_name, title, dob, email, id_number, address, country, state, zip, mobile_number, otp, } = req.body;
        const user = yield utills.db.Users.findOne({ where: { otp } });
        if (!user) {
            return res
                .status(400)
                .json(utills.helpers.sendError("Invalid user credential"));
        }
        const createCompany = yield utills.db.Directors.create({
            uuid: utills.uuid(),
            user_id: user.uuid,
            first_name,
            lastname_name,
            title,
            dob,
            email,
            id_number,
            address,
            country,
            state,
            zip,
            mobile_number,
        });
        if (createCompany) {
            let random = utills.uuid();
            const token = signToken(user, random);
            return res.status(200).json({
                success: {
                    status: "SUCCESS",
                    token,
                    message: "Your account was created successfully",
                },
            });
        }
    }),
};
