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
const util = require("../utils/packages");
const db = require("../database/mysql");
module.exports = {
    getProfile: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const Directors = yield db.dbs.Directors.findAll({
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
    }),
    addCargo: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
                .map((i) => i.message)
                .Join(".");
            return res.status(400).json(util.helpers.sendError(errorMessage));
        }
        const { capacity, available_capacity, take_off, geo_coverage, monthly_flight_time, is_available, airworthiness_type, airworthiness_make, airworthiness_model, airworthiness_cert_url, aircraft_registration, airworthiness_cert_exp_date, noise_cert_url, noise_cert_exp_date, insurance_cert_url, insurance_cert_exp_date, registration_cert, registration_cert_exp_date, mmel, ops_manual, } = req.body;
        let data = yield db.dbs.Quotes.create({
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
                .json(util.helpers.sendSuccess("Cargo added successfully for review, kindly hold while your cargo documents are being reviewd"));
        }
        return res
            .status(400)
            .json(util.helpers.sendError("Error, kindly try again"));
    }),
    requestQuote: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
                .map((i) => i.message)
                .Join(".");
            return res.status(400).json(util.helpers.sendError(errorMessage));
        }
        const { type, company_name, email, primary_phone, contact_fullname, phone_number, secondary_phone, length, width, weight, heigth, content, value, pick_up, destination, } = req.body;
        let data = yield db.dbs.Quotes.create({
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
                .json(util.helpers.sendSuccess("Your request was successfully submitted jetwest team will reach out to you shortly"));
        }
        return res
            .status(400)
            .json(util.helpers.sendError("Error, kindly try again"));
    }),
    bookShipping: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
            routes: util.Joi.string().required(),
        })
            .unknown();
        const validate1 = itemSchema.validate(req.body);
        if (validate1.error != null) {
            const errorMessage = validate1.error.details
                .map((i) => i.message)
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
                .map((i) => i.message)
                .join(".");
            return res.status(400).json(util.helpers.sendError(errorMessage));
        }
        const { items, agent_id, reciever_email, reciever_firstname, reciever_lastname, reciver_mobile, reciever_primaryMobile, reciever_secMobile, routes, } = req.body;
        let checker = yield db.dbs.Users.findOne({ where: { uuid: agent_id } });
        if (!checker) {
            return res.status(400).json(util.helpers.sendError("Agent not found"));
        }
        let shipment_num = util.helpers.generateReftId(10);
        let checkShipment = yield db.dbs.ShippingItems.findOne({
            where: { shipment_num },
        });
        if (checkShipment) {
            shipment_num = util.helpers.generateReftId(10);
        }
        for (const item of items) {
            let price;
            const { type, pickup_location, destination, width, height, weight, length, shipment_ref, category, promo_code, depature_date, value, content, } = item;
            let chargeable_weight;
            let volumetric_weight = (parseInt(width) * parseInt(height) * parseInt(length)) / 5000;
            chargeable_weight =
                volumetric_weight > parseInt(weight)
                    ? volumetric_weight
                    : parseInt(weight);
            if (promo_code) {
                let checkPromo = yield util.helpers.checkPromo(promo_code);
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
                }
                else {
                    price =
                        chargeable_weight * req.user.ratePerKg * (parseInt(discount) / 100);
                }
            }
            else {
                if (category === "fragile") {
                    price =
                        chargeable_weight * (chargeable_weight * 0.3) * req.user.ratePerKg;
                }
                else {
                    price = chargeable_weight * req.user.ratePerKg;
                }
            }
            // let reference = util.helpers.generateReftId(10);
            let route = yield db.dbs.ShipmentRoute.findOne({
                where: { route: routes },
            });
            if (!route) {
                return res.status(400).json(util.helpers.sendError("Route not found"));
            }
            if (parseInt(weight) > volumetric_weight) {
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
            }
            else {
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
            let status = yield db.dbs.ShippingItems.create({
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
            .json(util.helpers.sendSuccess("Shipment booked successfully, the Jetwest team would reach out to to soon."));
        // }
    }),
    getAllShipments: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        let shipment_num = req.query.shipment_num;
        if (!shipment_num) {
            return res
                .status(400)
                .json(util.helpers.sendError("Kindly add a valid item"));
        }
        let shipment = yield db.dbs.ShippingItems.findAll({
            where: { user_id: req.user.uuid, shipment_num: shipment_num },
        });
        return res.status(200).json({ shipment });
    }),
    getShipmentItem: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        let booking_reference = req.query.booking_reference;
        if (!booking_reference) {
            return res
                .status(400)
                .json(util.helpers.sendError("Kindly add a valid item"));
        }
        let shipment = yield db.dbs.ShippingItems.findAll({
            where: { user_id: req.user.uuid, booking_reference: booking_reference },
        });
        return res.status(200).json({ shipment });
    }),
    upcomingShipments: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        let shipment = yield db.dbs.ShippingItems.findAll({
            where: { user_id: req.user.uuid, status: "pending" },
        });
        return res.status(200).json({ shipment });
    }),
    enRouteShipments: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        let shipment = yield db.dbs.ShippingItems.findAll({
            where: { user_id: req.user.uuid, status: "enroute" },
        });
        return res.status(200).json({ shipment });
    }),
    completedShipments: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        let shipment = yield db.dbs.ShippingItems.findAll({
            where: { user_id: req.user.uuid, status: "completed" },
        });
        return res.status(200).json({ shipment });
    }),
    resetPassword: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
                .map((i) => i.message)
                .join(".");
            return res.status(400).json(util.helpers.sendError(errorMessage));
        }
        const { old_password, new_password } = req.body;
        let user = yield yield db.dbs.Users.findOne({
            where: { uuid: req.user.uuid },
        });
        if (util.bcrypt.compareSync(old_password, user.password)) {
            user.password = util.bcrypt.hashSync(new_password);
            yield user.save();
            return res
                .status(200)
                .json(util.helpers.sendSuccess("Password updated successfully"));
        }
        return res.status(400).json(util.helpers.sendError("Invalid password"));
    }),
};
