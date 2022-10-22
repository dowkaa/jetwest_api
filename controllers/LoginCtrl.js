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
const utill = require("../utils/packages");
const db = require("../database/mysql");
const signTokens = (user, token) => {
    var token = utill.jwt.sign({
        id: user.id,
        email: user.email,
        fullname: user.fullname,
        conpany_name: user.conpany_name,
        phone_number: user.phone_number,
        otp: user.otp,
    }, process.env.SECRET, {
        expiresIn: 1800,
    });
    var decoded = utill.jwt_decode(token);
    db.dbs.Oauth.create(decoded);
    return token;
};
module.exports = {
    Login: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const loginSchema = utill.Joi.object()
            .keys({
            email: utill.Joi.string().required(),
            password: utill.Joi.string().required(),
        })
            .unknown();
        const validate = loginSchema.validate(req.body);
        if (validate.error != null) {
            const errorMessage = validate.error.details
                .map((i) => i.message)
                .join(".");
            return res.status(400).json(utill.helpers.sendError(errorMessage));
        }
        const { email, password } = req.body;
        let user = yield db.dbs.Users.findOne({ where: { email } });
        if (!user) {
            return res
                .status(400)
                .json(utill.helpers.sendError("Account does not exist"));
        }
        if (user.activated == 0) {
            const code = user.otp;
            // setTimeout(async () => {
            //   user.otp = null;
            //   await user.save();
            // }, 40000);
            const option = {
                email: user.email,
                name: user.fullname,
                message: `Thanks for joining the Jetwest team, we promise to serve your shiping needs. <br /> Kindly use the token ${code} to activate your account. <br /><br /> Thanks.`,
            };
            try {
                utill.welcome.sendMail(option);
            }
            catch (error) {
                console.log({ error });
            }
            yield utill.helpers.deactivateOtp(email);
            // welcomes.sendMail(option);
            return res
                .status(400)
                .json(utill.helpers.sendError("Account has not been activated, kindly activate account with otp code sent to your email"));
        }
        if (utill.bcrypt.compareSync(password, user.password)) {
            if (user.locked === 1) {
                return res.status(400).json({
                    status: "ERROR",
                    code: "01",
                    message: "Your account has been locked, kindly contact support",
                });
            }
            let random = utill.uuid();
            const token = signTokens(user, random);
            return res.status(200).json({ success: { token } });
        }
        return res.status(400).json({
            status: "ERROR",
            code: "01",
            message: "Incorrect email or password",
        });
    }),
    removeTest: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        let email = req.query.email;
        let user = yield db.dbs.Users.findOne({ where: { email } });
        let quotes = yield db.dbs.Quotes.findOne({
            where: { user_id: user.uuid },
        });
        let mail = yield db.dbs.Mailing.findOne({
            where: { email: "kaluabel76@gmail.com" },
        });
        let company_info = yield db.dbs.CompanyInfo.findOne({
            where: { user_id: user.uuid },
        });
        yield company_info.destroy();
        yield quotes.destroy();
        yield user.destroy();
        yield mail.destroy();
        return res
            .status(200)
            .json(utill.helpers.sendSuccess("deleted successfully"));
    }),
};
