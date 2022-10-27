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
const utilz = require("../utils/packages");
const db = require("../database/mysql");
module.exports = {
    getFags: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        let faqs = yield db.dbs.Faqs.findAll();
        return res.status(200).json({ faqs });
    }),
    getTestimonials: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        let testimonials = yield db.dbs.Testimonials.findAll();
        return res.status(200).json({ testimonials });
    }),
    postMailing: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const loginSchema = utilz.Joi.object()
            .keys({
            email: utilz.Joi.string().required(),
        })
            .unknown();
        const validate = loginSchema.validate(req.body);
        if (validate.error != null) {
            const errorMessage = validate.error.details
                .map((i) => i.message)
                .join(".");
            return res.status(400).json(utilz.helpers.sendError(errorMessage));
        }
        yield db.dbs.Mailing.create({
            uuid: utilz.uuid(),
            email: req.body.email,
        });
        return res
            .status(200)
            .json(utilz.helpers.sendSuccess("Email successfully added to mailing list"));
    }),
    requestOtp: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        let { email, mobile } = req.query;
        var code = utilz.helpers.generateClientId(6);
        if (email) {
            if (!email || !email.includes("@")) {
                return res
                    .status(400)
                    .json(utilz.helpers.sendError("Kindly enter a valid email"));
            }
            let user = yield db.dbs.Users.findOne({
                where: { email: email },
            });
            if (!user) {
                return res.status(400).json(utilz.helpers.sendError("User not found"));
            }
            if (user.activated === 1) {
                return res
                    .status(400)
                    .json(utilz.helpers.sendError("Email already validated, kindly login to your account"));
            }
            if (user.otp) {
                return res
                    .status(400)
                    .json(utilz.helpers.sendError("Code already sent, kindly wait for 4 minutes to request another code"));
            }
            user.otp = code;
            yield user.save();
            const option = {
                email: email,
                name: `${user.first_name} ${user.last_name}`,
                message: `Thanks for Jetwest the Jetwest team, we promise to serve your shiping needs. Kindly use the token ${code} to activate your account. 
        Thanks.`,
            };
            utilz.welcome.sendMail(option);
            yield utilz.helpers.deactivateOtp(email);
        }
        else if (mobile) {
            if (/[a-zA-Z]/.test(mobile)) {
                return res
                    .status(400)
                    .json(utilz.helpers.sendError("Kindly enter a valid mobile number"));
            }
            let user = yield db.dbs.Users.findOne({
                where: { mobile_number: mobile },
            });
            if (!user) {
                return res.status(400).json(utilz.helpers.sendError("User not found"));
            }
            if (user.activated === 1) {
                return res
                    .status(400)
                    .json(utilz.helpers.sendError("Email already validated, kindly login to your account"));
            }
            if (user.otp) {
                return res
                    .status(400)
                    .json(utilz.helpers.sendError("Code already sent, kindly wait for 4 minutes to request another code"));
            }
            user.otp = code;
            yield user.save();
            const message = `Thanks for Jetwest the Jetwest team, we promise to serve your shiping needs. Kindly use the token ${code} to activate your account. 
        Thanks.`;
            // utilz.welcome.sendMail(option);
            yield utilz.helpers.deactivateOtp(mobile);
        }
        else {
            return res
                .status(400)
                .json(utilz.helpers.sendError("Kindly add a valid query parameter"));
        }
        return res
            .status(200)
            .json(utilz.helpers.sendSuccess("kindly activate account with otp code sent to your mobile number"));
    }),
    updateRegStatus: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        let { email, status } = req.query;
        if (!email && status) {
            return res
                .status(400)
                .json(utilz.helpers.sendError("Enter a valid search parameter"));
        }
        let user = yield db.dbs.Users.findOne({
            where: { email: email },
        });
        if (!user) {
            return res.status(400).json(utilz.helpers.sendError("User not found"));
        }
        user.reg_status = status;
        yield user.save();
        return res
            .status(200)
            .json(utilz.helpers.sendSuccess("User registration status updated successfully"));
    }),
    allCargos: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        let cargos = yield db.dbs.Cargo.findAll({ where: { is_available: 1 } });
        return res.status(200).json({ cargos });
    }),
    singleCargo: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        let id = req.query.cargo_id;
        if (!id) {
            return res
                .status(400)
                .json(utilz.helpers.sendError("Enter a valid search parameter"));
        }
        let cargo = yield db.dbs.Cargo.findAll({ where: { uuid: id } });
        if (!cargo) {
            return res.status(400).json(utilz.helpers.sendError("Cargo not found"));
        }
        return res.status(200).json({ cargo });
    }),
    getRegStatus: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        let { email } = req.query;
        let user = yield db.dbs.Users.findOne({
            where: { email: email },
        });
        if (!user) {
            return res.status(400).json(utilz.helpers.sendError("User not found"));
        }
        return res.status(200).json({ status: user.reg_status });
    }),
    allAgents: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        let airport = req.query.airport;
        if (!airport) {
            return res
                .status(400)
                .json(utilz.helpers.sendError("Enter a valid search parameter"));
        }
        let agents = yield db.dbs.Users.findAll({
            where: { airport: airport, type: "Agent" },
        });
        let arr = [];
        for (const agent of agents) {
            const Directors = yield db.dbs.Directors.findAll({
                where: { user_id: agent.uuid },
            });
            const user = {
                uuid: agent.uuid,
                first_name: agent.first_name,
                last_name: agent.last_name,
                customer_id: agent.customer_id,
                username: agent.username,
                email: agent.email,
                country: agent.country,
                mobile_number: agent.mobile_number,
                company_name: agent.company_name,
                company_address: agent.company_address,
                companyFounded: agent.companyFounded,
                type: agent.type,
                ratePerKg: agent.ratePerkg,
                locked: agent.locked,
                activated: agent.activated,
                Directors,
            };
            arr.push(user);
        }
        return res.status(200).json({ arr });
    }),
    singleAgent: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        let uuid = req.query.id;
        if (!uuid) {
            return res
                .status(400)
                .json(utilz.helpers.sendError("Enter a valid search parameter"));
        }
        let agent = yield db.dbs.Users.findOne({ where: { uuid: uuid } });
        if (!agent) {
            return res.status(400).json(utilz.helpers.sendError("Agent not found"));
        }
        const Directors = yield db.dbs.Directors.findAll({
            where: { user_id: agent.uuid },
        });
        const user = {
            uuid: agent.uuid,
            first_name: agent.first_name,
            last_name: agent.last_name,
            customer_id: agent.customer_id,
            username: agent.username,
            email: agent.email,
            country: agent.country,
            mobile_number: agent.mobile_number,
            company_name: agent.company_name,
            company_address: agent.company_address,
            companyFounded: agent.companyFounded,
            type: agent.type,
            ratePerKg: agent.ratePerkg,
            locked: agent.locked,
            activated: agent.activated,
            Directors,
        };
        return res.status(200).json({ agent: user });
    }),
    getShippingData: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        let refId = req.query.refId;
        if (!refId) {
            return res
                .status(400)
                .json(utilz.helpers.sendError("Enter a valid reference id"));
        }
        let data = yield db.dbs.ShippingItems.findOne({
            where: { booking_reference: refId },
        });
        if (!data) {
            return res
                .status(400)
                .json(utilz.helpers.sendError("Booking data with reference id not found"));
        }
        return res.status(200).json(utilz.helpers.sendSuccess({ data }));
    }),
    checkPromo: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        let code = req.query.code;
        if (!code) {
            return res
                .status(400)
                .json(utilz.helpers.sendError("Enter a valid search parameter"));
        }
        let checker = yield db.dbs.Promotions.findOne({ where: { code: code } });
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
    }),
};
