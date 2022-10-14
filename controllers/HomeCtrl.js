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
