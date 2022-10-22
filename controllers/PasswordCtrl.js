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
const signTokens = (user, token) => {
    var token = util.jwt.sign({
        id: user.id,
        email: user.email,
        fullname: user.fullname,
        conpany_name: user.conpany_name,
        phone_number: user.phone_number,
        otp: user.otp,
    }, process.env.SECRET, {
        expiresIn: 1800,
    });
    var decoded = util.jwt_decode(token);
    db.dbs.Oauth.create(decoded);
    return token;
};
module.exports = {
    forgotPassword: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        let { email, mobile } = req.query;
        if (email) {
            if (!email || !email.includes("@")) {
                return res
                    .status(400)
                    .json(util.helpers.sendError("Kindly enter a valid email"));
            }
            let user = yield db.dbs.Users.findOne({ where: { email: email } });
            if (!user) {
                return res
                    .status(400)
                    .json(util.helpers.sendError("No user with this email found"));
            }
            var code = util.helpers.generateClientId(6);
            user.otp = code;
            yield user.save();
            let option = {
                email,
                message: `Kindly use the code ${code} to verify your account`,
            };
            util.reset.sendMailer(option);
            return res
                .status(200)
                .json(util.helpers.sendSuccess("An otp was sent to your email, kindly use the otp to validate your email"));
        }
        else if (mobile) {
            if (/[a-zA-Z]/.test(mobile)) {
                return res
                    .status(400)
                    .json(util.helpers.sendError("Kindly enter a valid mobile number"));
            }
            let user = yield db.dbs.Users.findOne({
                where: { mobile_number: mobile },
            });
            if (!user) {
                return res.status(400).json(util.helpers.sendError("User not found"));
            }
            if (user.otp) {
                return res
                    .status(400)
                    .json(util.helpers.sendError("Code already sent, kindly wait for 4 minutes to request another code"));
            }
            user.otp = code;
            yield user.save();
            const message = `Kindly use the code ${code} to verify your account`;
            // utilz.welcome.sendMail(option);
            //  await utilz.helpers.deactivateOtp(mobile);
            return res
                .status(200)
                .json(util.helpers.sendSuccess("An otp was sent to your email, kindly use the otp to validate your email"));
        }
        else {
            return res
                .status(400)
                .json(util.helpers.sendError("Kindly add a valid query parameter"));
        }
    }),
    validatePasswordReset: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const loginSchema = util.Joi.object()
            .keys({
            otp: util.Joi.string().required(),
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
        const { otp, new_password } = req.body;
        let user = yield db.dbs.Users.findOne({ where: { otp: otp } });
        if (!user) {
            return res
                .status(400)
                .json(util.helpers.sendError("No user with this otp found"));
        }
        user.password = util.bcrypt.hashSync(new_password);
        yield user.save();
        let random = util.uuid();
        const token = signTokens(user, random);
        return res
            .status(200)
            .json({ success: { token }, message: "password successfully changed" });
    }),
};
